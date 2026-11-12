FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY corporate-ca.pem /usr/local/share/ca-certificates/corporate-ca.crt
COPY root-ca.pem /usr/local/share/ca-certificates/root-ca.crt
RUN update-ca-certificates
COPY publish/ .
EXPOSE 8080
ENTRYPOINT ["dotnet", "LsfApi.dll"]
