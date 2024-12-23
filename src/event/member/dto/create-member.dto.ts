import { IsString } from 'class-validator';

export class CreateMemberDto {
  @IsString()
  readonly user_id: string;
}
