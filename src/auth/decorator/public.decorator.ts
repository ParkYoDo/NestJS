import { Reflector } from '@nestjs/core';

// 전체가 Private Guard 적용되어 있는데 일부는 Public으로 설정하기 위함
export const Public = Reflector.createDecorator<boolean>();
