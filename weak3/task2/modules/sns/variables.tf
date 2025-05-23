variable "alert_email" {
  description = "Pull of emails for scaling up alarms"
  type = list(string)
  default = []
}
