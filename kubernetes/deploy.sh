#helm upgrade db https://kubernetes-charts.storage.googleapis.com/mongodb-7.4.6.tgz -f db.yaml -n demoapps --install

#sleep 20

helm upgrade nodejs https://code.benco.io/helm-charts/webapp-1.0.0.tgz -f app.yaml -n demoapps --install

