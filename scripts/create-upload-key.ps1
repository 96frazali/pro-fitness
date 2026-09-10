param(
  [string]$Alias = "repwise",
  [string]$KeyFile = "repwise-upload-key.jks",
  [switch]$Automatic
)

$ErrorActionPreference = "Stop"

function ConvertTo-PlainText([System.Security.SecureString]$Value) {
  $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Value)
  try {
    return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
  }
  finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
  }
}

function New-StrongPassword {
  $alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%*-_"
  $bytes = [byte[]]::new(32)
  $random = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  try {
    $random.GetBytes($bytes)
  }
  finally {
    $random.Dispose()
  }
  return -join ($bytes | ForEach-Object { $alphabet[$_ % $alphabet.Length] })
}

$androidPath = Join-Path $PSScriptRoot "..\android"
$androidPath = (Resolve-Path -LiteralPath $androidPath).Path
$propertiesPath = Join-Path $androidPath "keystore.properties"
$keyPath = Join-Path $androidPath $KeyFile

if ((Test-Path -LiteralPath $keyPath) -or (Test-Path -LiteralPath $propertiesPath)) {
  throw "A Repwise upload key or keystore.properties already exists. Keep using it for future updates; do not create a second key."
}

$javaHome = $env:JAVA_HOME
if (-not $javaHome) {
  $androidStudioJbr = "C:\Program Files\Android\Android Studio\jbr"
  if (Test-Path -LiteralPath $androidStudioJbr) {
    $javaHome = $androidStudioJbr
  }
}

$keytool = if ($javaHome) { Join-Path $javaHome "bin\keytool.exe" } else { $null }
if (-not $keytool -or -not (Test-Path -LiteralPath $keytool)) {
  throw "Set JAVA_HOME to a JDK that includes keytool.exe, then run this script again."
}

if ($Automatic) {
  $owner = "Repwise Upload Key"
  $storePassword = New-StrongPassword
  $keyPassword = New-StrongPassword
}
else {
  $owner = Read-Host "Owner or business name for the certificate"
  if ([string]::IsNullOrWhiteSpace($owner)) {
    throw "An owner or business name is required."
  }
  $storePassword = ConvertTo-PlainText (Read-Host "New keystore password" -AsSecureString)
  $keyPassword = ConvertTo-PlainText (Read-Host "New key password (press Enter to use the keystore password)" -AsSecureString)
}
if ([string]::IsNullOrWhiteSpace($storePassword) -or $storePassword.Length -lt 12) {
  throw "Use a keystore password with at least 12 characters."
}
if ([string]::IsNullOrWhiteSpace($keyPassword)) {
  $keyPassword = $storePassword
}
if ($keyPassword.Length -lt 12) {
  throw "Use a key password with at least 12 characters."
}

try {
  $dname = "CN=$owner, OU=Repwise, O=Repwise"
  & $keytool -genkeypair -v -keystore $keyPath -storetype JKS -alias $Alias -keyalg RSA -keysize 4096 -validity 10000 -dname $dname -storepass $storePassword -keypass $keyPassword
  if ($LASTEXITCODE -ne 0) {
    throw "keytool failed to create the upload key."
  }

  $properties = @(
    "storeFile=$KeyFile",
    "storePassword=$storePassword",
    "keyAlias=$Alias",
    "keyPassword=$keyPassword"
  ) -join [Environment]::NewLine
  [System.IO.File]::WriteAllText($propertiesPath, $properties, [System.Text.UTF8Encoding]::new($false))
  Write-Host "Repwise upload key created. Back up $KeyFile and keep keystore.properties private."
}
finally {
  $storePassword = $null
  $keyPassword = $null
}
