output "sns_arn" {
  description = "SNS topic arn for notifying certain group of people by email"
  value = aws_sns_topic.demo_scale_up_email.arn
}