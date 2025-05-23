resource "aws_sns_topic" "demo_scale_up_email" {
  name = "email_scale_up_trigger_topic"
}

resource "aws_sns_topic_subscription" "email_addresses" {
  for_each = toset(var.alert_email)

  endpoint  = each.key
  protocol  = "email"
  topic_arn = aws_sns_topic.demo_scale_up_email.id
}