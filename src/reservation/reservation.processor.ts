import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
//consumer
@Processor('reservation')
export class ReservationProcessor {
  @Process()
  async myJob(job: Job) {
    console.log(job.data);
    console.log(Math.random());
  }
}
