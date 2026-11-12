output "instance_id" {
  description = "ID da instância EC2."
  value       = aws_instance.app.id
}

output "public_ip" {
  description = "IP público do servidor."
  value       = aws_instance.app.public_ip
}

output "app_url" {
  description = "Endereço onde a API ficará disponível após o deploy."
  value       = "http://${aws_instance.app.public_ip}:${var.app_port}"
}
