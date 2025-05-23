output "ec2_sg" {
  description = "EC2 security group id with alb_sg inbound"
  value       = aws_security_group.demo_ec2_sg.id
}

output "alb_sg" {
  description = "ALB security group id with 80 port inbound"
  value = aws_security_group.demo_alb_sg.id
}