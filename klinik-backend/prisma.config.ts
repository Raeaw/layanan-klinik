import 'dotenv/config'; // Tambahkan baris ajaib ini di paling atas!
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  datasource: {
    url: env('DATABASE_URL'), // Atau bisa juga menggunakan process.env.DATABASE_URL
  },
});