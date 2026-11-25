{
  import = [
    {
      to = "google_cloud_scheduler_job.sync-portfolio-weekly";
      id = "projects/\${var.project_id}/locations/\${var.region}/jobs/ar-at-localhost-staging-sync-portfolio-weekly";
    }
    {
      to = "google_cloud_tasks_queue.connect";
      id = "projects/\${var.project_id}/locations/\${var.region}/queues/ar-at-localhost-staging-connect";
    }
    {
      to = "google_cloud_tasks_queue.sync-portfolio";
      id = "projects/\${var.project_id}/locations/\${var.region}/queues/ar-at-localhost-staging-sync-portfolio";
    }
    {
      to = "google_cloud_tasks_queue.testimonial-request";
      id = "projects/\${var.project_id}/locations/\${var.region}/queues/ar-at-localhost-staging-testimonial-request";
    }
  ];
}
