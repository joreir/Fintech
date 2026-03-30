FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["FinTech.API/FinTech.API.csproj", "FinTech.API/"]
COPY ["FinTech.Core/FinTech.Core.csproj", "FinTech.Core/"]
COPY ["FinTech.Infrastructure/FinTech.Infrastructure.csproj", "FinTech.Infrastructure/"]
RUN dotnet restore "FinTech.API/FinTech.API.csproj"

COPY . .
WORKDIR "/src/FinTech.API"
RUN dotnet publish "FinTech.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 10000
ENV ASPNETCORE_URLS=http://+:10000
ENTRYPOINT ["dotnet", "FinTech.API.dll"]
