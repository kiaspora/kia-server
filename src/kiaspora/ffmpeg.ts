import { spawn } from 'node:child_process';

type TranscodeArgs = {
  input: string;
  output: string;
  args: string[];
};

export async function transcode(job: TranscodeArgs): Promise<void> {
  const ffmpegBin = (process.env.FFMPEG_PATH || 'ffmpeg').trim();

  await new Promise<void>((resolve, reject) => {
    const p = spawn(ffmpegBin, ['-y', '-i', job.input, ...job.args, job.output], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stderr = '';
    p.stderr.on('data', (d) => (stderr += d.toString()));
    p.on('error', (err) => reject(err));
    p.on('close', (code) => {
      if (code === 0) return resolve();
      reject(new Error(`ffmpeg exited ${code}: ${stderr}`));
    });
  });
}
