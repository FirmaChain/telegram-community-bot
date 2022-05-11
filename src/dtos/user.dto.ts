import { IsNumber } from "class-validator";

export class User {
  @IsNumber()
  date: number;

  @IsNumber()
  id: number
}