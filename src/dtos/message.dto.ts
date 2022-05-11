import { IsNumber } from "class-validator";

export class Message {
  @IsNumber()
  date: number;

  @IsNumber()
  id: number;
}