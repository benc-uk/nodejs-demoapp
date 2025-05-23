output "target_group_arn" {
  description = "ALB proxy traffic between instances inside target group with arn"
  value = aws_lb_target_group.demo_tg.arn
}

output "alb_dns" {
  description = "ALB dns name for connection"
  value = aws_lb.demo_alb.dns_name
}