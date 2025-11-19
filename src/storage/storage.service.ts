import { Injectable, Inject, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN_CLIENT } from '../supabase/supabase-admin.provider';
import 'multer'
@Injectable()
export class StorageService {
  constructor(
    @Inject(SUPABASE_ADMIN_CLIENT) private readonly supabaseAdmin: SupabaseClient,
  ) {}

  /**
   * A generic method to upload any file to a specified Supabase Storage bucket.
   *
   * @param file The file object (Express.Multer.File) from the request.
   * @param bucket The name of the Supabase Storage bucket (e.g., 'profile-pictures').
   * @param folderPath An optional path within the bucket to organize files (e.g., 'chauffeur-1/').
   * @returns An object containing the path of the uploaded file.
   */
  async upload(file: Express.Multer.File, bucket: string, folderPath: string = ''): Promise<{ path: string }> {
    if (!file) {
      throw new BadRequestException('No file provided for upload.');
    }

    // Ensure the folder path ends with a slash if it's provided
    const finalFolderPath = folderPath && !folderPath.endsWith('/') ? `${folderPath}/` : folderPath;
    
    // Create a unique file name to prevent overwrites.
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${finalFolderPath}${Date.now()}.${fileExtension}`;

    // Upload the file to the specified bucket
    const { data: uploadData, error: uploadError } = await this.supabaseAdmin
      .storage
      .from(bucket)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (uploadError) {
      throw new InternalServerErrorException(`Failed to upload file: ${uploadError.message}`);
    }

    // IMPORTANT: We now return the path, which is the file's unique identifier in the bucket.
    return { path: uploadData.path };
  }

  /**
   * Generates a permanent public URL for a file in a PUBLIC bucket.
   *
   * @param bucket The name of the public bucket.
   * @param path The path to the file within the bucket.
   * @returns The permanent public URL.
   */
  getPublicUrl(bucket: string, path: string): string {
    const { data } = this.supabaseAdmin
      .storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  }

  /**
   * Generates a temporary, signed URL to view a file in a PRIVATE bucket.
   *
   * @param bucket The name of the private bucket.
   * @param path The path to the file within the bucket.
   * @param expiresInSeconds The duration for which the link will be valid (in seconds).
   * @returns The temporary signed URL.
   */
  async createSignedUrl(bucket: string, path: string, expiresInSeconds: number = 60): Promise<string> {
    const { data, error } = await this.supabaseAdmin
      .storage
      .from(bucket)
      .createSignedUrl(path, expiresInSeconds);

    if (error) {
      throw new InternalServerErrorException(`Failed to create signed URL: ${error.message}`);
    }

    return data.signedUrl;
  }
}