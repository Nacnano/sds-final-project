export class CreateWishDto {
  wisher_id: string;
  shrine_id: string;
  wisher_name?: string;
  description: string;
  public?: boolean;
}
