resource "aws_autoscaling_group" "demo_asg" {
  desired_capacity     = var.desired_capacity_alb
  max_size             = var.max_capacity_alb
  min_size             = var.min_capacity_alb
  vpc_zone_identifier  = data.aws_subnets.default.ids
  target_group_arns    = [aws_lb_target_group.demo_tg.arn]

  launch_template {
    id      = aws_launch_template.demo_lt.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "demo-instance"
    propagate_at_launch = true
  }

  lifecycle {
    create_before_destroy = true
  }
}
