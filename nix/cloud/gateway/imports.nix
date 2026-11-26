{
  import = [
    {
      to = "google_api_gateway_api.services";
      id = "projects/\${var.project_id}/locations/global/apis/\${var.project_id}";
    }
    {
      to = "google_cloud_scheduler_job.sync-portfolio-weekly";
      id = "projects/\${var.project_id}/locations/\${var.region}/jobs/\${var.project_id}-sync-portfolio-weekly";
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
