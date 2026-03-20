FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["Cinestream.sln", "./"]
COPY ["src/Cinestream.API/Cinestream.API.csproj", "src/Cinestream.API/"]
COPY ["src/Cinestream.Application/Cinestream.Application.csproj", "src/Cinestream.Application/"]
COPY ["src/Cinestream.Domain/Cinestream.Domain.csproj", "src/Cinestream.Domain/"]
COPY ["src/Cinestream.Infrastructure/Cinestream.Infrastructure.csproj", "src/Cinestream.Infrastructure/"]
RUN dotnet restore "src/Cinestream.API/Cinestream.API.csproj"

COPY . .
WORKDIR "/src/src/Cinestream.API"
RUN dotnet build "Cinestream.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Cinestream.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Cinestream.API.dll"]
