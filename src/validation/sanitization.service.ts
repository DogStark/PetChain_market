import { Injectable } from '@nestjs/common';
import * as sanitizeHtml from 'sanitize-html';
import * as xss from 'xss';

@Injectable()
export class SanitizationService {
  private readonly sanitizeOptions = {
    allowedTags: ['b', 'i', 'em', 'strong', 'a'],
    allowedAttributes: {
      a: ['href']
    },
    allowedIframeHostnames: []
  };

  private readonly xssOptions = {
    whiteList: {}, // No tags allowed
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script']
  };

  sanitizeInput(input: string): string {
    return sanitizeHtml(input, this.sanitizeOptions);
  }

  sanitizeObject<T>(obj: T): T {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item)) as unknown as T;
    }

    const sanitizedObj = {} as T;
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitizedObj[key] = this.sanitizeInput(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitizedObj[key] = this.sanitizeObject(value);
      } else {
        sanitizedObj[key] = value;
      }
    }

    return sanitizedObj;
  }

  preventXSS(input: string): string {
    const xssFilter = new xss.FilterXSS(this.xssOptions);
    return xssFilter.process(input);
  }
} 