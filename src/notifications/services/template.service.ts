import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import type { Repository } from "typeorm"
import type {
  NotificationTemplate,
  NotificationChannel,
  TemplateCategory,
} from "../entities/notification-template.entity"
import Handlebars from "handlebars"

type HandlebarsTemplateDelegate = Handlebars.TemplateDelegate

@Injectable()
export class TemplateService {
  private readonly logger = new Logger(TemplateService.name)
  private readonly compiledTemplates = new Map<string, HandlebarsTemplateDelegate>()

  constructor(private readonly templateRepository: Repository<NotificationTemplate>) {
    this.registerHelpers()
  }

  async getTemplate(templateKey: string, language = "en"): Promise<NotificationTemplate> {
    const template = await this.templateRepository.findOne({
      where: {
        template_key: templateKey,
        language,
        is_active: true,
      },
    })

    if (!template) {
      // Fallback to English if specific language not found
      if (language !== "en") {
        return this.getTemplate(templateKey, "en")
      }
      throw new NotFoundException(`Template not found: ${templateKey}`)
    }

    return template
  }

  async renderTemplate(
    templateKey: string,
    variables: Record<string, any>,
    language = "en",
  ): Promise<{ subject?: string; content: string; html_content?: string }> {
    const template = await this.getTemplate(templateKey, language)

    try {
      const cacheKey = `${template.id}_${template.version}`

      // Get or compile template
      let compiledContent = this.compiledTemplates.get(`${cacheKey}_content`)
      if (!compiledContent) {
        compiledContent = Handlebars.compile(template.content)
        this.compiledTemplates.set(`${cacheKey}_content`, compiledContent)
      }

      let compiledSubject: HandlebarsTemplateDelegate | undefined
      if (template.subject) {
        compiledSubject = this.compiledTemplates.get(`${cacheKey}_subject`)
        if (!compiledSubject) {
          compiledSubject = Handlebars.compile(template.subject)
          this.compiledTemplates.set(`${cacheKey}_subject`, compiledSubject)
        }
      }

      let compiledHtml: HandlebarsTemplateDelegate | undefined
      if (template.html_content) {
        compiledHtml = this.compiledTemplates.get(`${cacheKey}_html`)
        if (!compiledHtml) {
          compiledHtml = Handlebars.compile(template.html_content)
          this.compiledTemplates.set(`${cacheKey}_html`, compiledHtml)
        }
      }

      // Render templates
      const result = {
        subject: compiledSubject ? compiledSubject(variables) : undefined,
        content: compiledContent(variables),
        html_content: compiledHtml ? compiledHtml(variables) : undefined,
      }

      this.logger.debug(`Template rendered successfully: ${templateKey}`)
      return result
    } catch (error) {
      this.logger.error(`Failed to render template ${templateKey}`, error.stack)
      throw new Error(`Template rendering failed: ${error.message}`)
    }
  }

  async createTemplate(templateData: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
    const template = this.templateRepository.create(templateData)
    const savedTemplate = await this.templateRepository.save(template)

    this.logger.log(`Template created: ${savedTemplate.template_key}`)
    return savedTemplate
  }

  async updateTemplate(id: string, updateData: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
    const template = await this.templateRepository.findOne({ where: { id } })

    if (!template) {
      throw new NotFoundException("Template not found")
    }

    // Increment version if content changed
    if (updateData.content || updateData.html_content || updateData.subject) {
      updateData.version = template.version + 1
    }

    Object.assign(template, updateData)
    const updatedTemplate = await this.templateRepository.save(template)

    // Clear compiled template cache
    this.clearTemplateCache(template.id)

    this.logger.log(`Template updated: ${updatedTemplate.template_key}`)
    return updatedTemplate
  }

  async getTemplatesByCategory(category: TemplateCategory): Promise<NotificationTemplate[]> {
    return this.templateRepository.find({
      where: { category, is_active: true },
      order: { name: "ASC" },
    })
  }

  async getTemplatesByChannel(channel: NotificationChannel): Promise<NotificationTemplate[]> {
    return this.templateRepository.find({
      where: { channel, is_active: true },
      order: { name: "ASC" },
    })
  }

  private registerHelpers(): void {
    // Date formatting helper
    Handlebars.registerHelper("formatDate", (date: Date, format: string) => {
      if (!date) return ""

      const d = new Date(date)
      switch (format) {
        case "short":
          return d.toLocaleDateString()
        case "long":
          return d.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        case "time":
          return d.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })
        default:
          return d.toLocaleString()
      }
    })

    // Currency formatting helper
    Handlebars.registerHelper("formatCurrency", (amount: number, currency = "USD") => {
      if (typeof amount !== "number") return ""
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
      }).format(amount)
    })

    // Capitalize helper
    Handlebars.registerHelper("capitalize", (str: string) => {
      if (!str) return ""
      return str.charAt(0).toUpperCase() + str.slice(1)
    })

    // Conditional helper
    Handlebars.registerHelper("ifEquals", function (arg1, arg2, options) {
      return arg1 === arg2 ? options.fn(this) : options.inverse(this)
    })

    // URL helper
    Handlebars.registerHelper("url", (path: string, baseUrl?: string) => {
      const base = baseUrl || process.env.APP_URL || "http://localhost:3000"
      return `${base}${path.startsWith("/") ? "" : "/"}${path}`
    })
  }

  private clearTemplateCache(templateId: string): void {
    const keysToDelete = Array.from(this.compiledTemplates.keys()).filter((key) => key.startsWith(templateId))
    keysToDelete.forEach((key) => this.compiledTemplates.delete(key))
  }

  async validateTemplate(content: string, variables: Record<string, any> = {}): Promise<boolean> {
    try {
      const compiled = Handlebars.compile(content)
      compiled(variables)
      return true
    } catch (error) {
      this.logger.error("Template validation failed", error.stack)
      return false
    }
  }
}
