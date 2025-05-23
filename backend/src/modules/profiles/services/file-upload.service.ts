import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileUploadService {
  private readonly uploadDir: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadDir = this.configService.get<string>('UPLOAD_DIR', 'uploads');
    this.ensureUploadDirExists();
  }

  /**
   * u0627u0644u062au0623u0643u062f u0645u0646 u0648u062cu0648u062f u0645u062cu0644u062f u0627u0644u0631u0641u0639
   */
  private ensureUploadDirExists(): void {
    const avatarsDir = path.join(this.uploadDir, 'avatars');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
    if (!fs.existsSync(avatarsDir)) {
      fs.mkdirSync(avatarsDir, { recursive: true });
    }
  }

  /**
   * u0631u0641u0639 u0635u0648u0631u0629 u0627u0644u0645u0644u0641 u0627u0644u0634u062eu0635u064a (u0627u0644u0623u0641u0627u062au0627u0631)
   */
  async uploadAvatar(userId: string, file: Express.Multer.File): Promise<string> {
    try {
      const filename = `${uuidv4()}-${file.originalname}`;
      const filePath = path.join(this.uploadDir, 'avatars', filename);
      
      // u0643u062au0627u0628u0629 u0627u0644u0645u0644u0641
      fs.writeFileSync(filePath, file.buffer);
      
      // u0625u0631u062cu0627u0639 u0627u0644u0645u0633u0627u0631 u0627u0644u0646u0633u0628u064a u0644u0627u0633u062au062eu062fu0627u0645u0647 u0641u064a u0627u0644u062eu062fu0645u0629
      return `avatars/${filename}`;
    } catch (error) {
      throw new Error(`u062eu0637u0623 u0641u064a u0631u0641u0639 u0627u0644u0635u0648u0631u0629: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    }
  }

  /**
   * u062du0630u0641 u0635u0648u0631u0629 u0642u062fu064au0645u0629
   */
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.uploadDir, filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
      return true;
    } catch (error) {
      console.error(`u062eu0637u0623 u0641u064a u062du0630u0641 u0627u0644u0645u0644u0641: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
      return false;
    }
  }
}