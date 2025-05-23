resource "aws_cloudwatch_metric_alarm" "cpu_high" {
  alarm_name          = "cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 60
  statistic           = "Average"
  threshold           = var.threshold_cloudwatch
  alarm_description   = "Scale up if CPU > 30%"
  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.demo_asg.name
  }
  alarm_actions = [
    aws_autoscaling_policy.scale_out.arn,
    aws_sns_topic.demo_scale_up_email.arn
  ]
}

resource "aws_autoscaling_policy" "scale_out" {
  name                   = "scale-out"
  scaling_adjustment     = 1
  adjustment_type        = "ChangeInCapacity"
  cooldown               = 60
  autoscaling_group_name = aws_autoscaling_group.demo_asg.name
}
