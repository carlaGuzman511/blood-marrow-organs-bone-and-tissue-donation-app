FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution file
COPY *.sln .
RUN ls -la
RUN find . -maxdepth 3
# Copy project files
COPY Umss.BloodOrgansDonationApp.API/*.csproj ./Umss.BloodOrgansDonationApp.API/
COPY Umss.BloodOrgansDonationApp.Models/*.csproj ./Umss.BloodOrgansDonationApp.Models/
COPY Umss.BloodOrgansDonationApp.Repository/*.csproj ./Umss.BloodOrgansDonationApp.Repository/
COPY Umss.BloodOrgansDonationApp.Services/*.csproj ./Umss.BloodOrgansDonationApp.Services/

# Restore dependencies
RUN dotnet restore Umss.BloodOrgansDonationApp.API/Umss.BloodOrgansDonationApp.API.csproj

# Copy everything else
COPY . .

# Publish the API
WORKDIR /src/Umss.BloodOrgansDonationApp.API

RUN dotnet publish Umss.BloodOrgansDonationApp.API.csproj \
    -c Release \
    -r linux-x64 \
    --self-contained false \
    -o /app/publish

# =========================
# RUNTIME STAGE
# =========================
FROM mcr.microsoft.com/dotnet/aspnet:8.0

WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "Umss.BloodOrgansDonationApp.API.dll"]
