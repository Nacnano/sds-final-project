import { Injectable } from '@nestjs/common';

@Injectable()
export class ApiGatewayService {
  getHello(): string {
    return 'Hello World!';
  }

  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
