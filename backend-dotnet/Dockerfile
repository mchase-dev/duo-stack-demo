# Multi-stage build for .NET backend
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src

# Copy csproj and restore dependencies
COPY DuoStackDemo.Api/DuoStackDemo.csproj ./
RUN dotnet restore

# Copy source code
COPY DuoStackDemo.Api/ .

# Build and publish
RUN dotnet publish -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0

WORKDIR /app

# Copy published files
COPY --from=build /app/publish .

# Create uploads directory
RUN mkdir -p ./uploads

# Expose port
EXPOSE 5000

# Set environment variable
ENV ASPNETCORE_URLS=http://+:5000

# Start application
ENTRYPOINT ["dotnet", "DuoStackDemo.dll"]
