# Refonte palette Beauté Halal v3 : doré / chocolat / blanc / noir / argenté
# Remplacement global des anciennes couleurs dans src/**/*.{vue,css}
$ErrorActionPreference = 'Stop'
$root = 'C:\Users\HP\beaute\beaute_halal_v3\src'

$map = [ordered]@{
  # Dégradé sur fond sombre (titres + bouton principal)
  '#ffc46b, #ff8f6b 55%, #ff7aa0' = '#f0d98c, #dcb95e 55%, #b8912f'
  # Encres aubergine -> noir chaud
  'rgba(42, 21, 32'   = 'rgba(24, 19, 16'
  '#2a1520'           = '#181310'
  # Bordeaux/vin -> chocolat
  'rgba(107, 35, 71'  = 'rgba(74, 54, 36'
  'rgba(74, 31, 61'   = 'rgba(51, 36, 26'
  '#4a1f3d'           = '#2c1f15'
  '#4a2433'           = '#33241a'
  '#6b2347'           = '#4a3624'
  # Rose/magenta -> doré
  'rgba(232, 88, 127' = 'rgba(201, 162, 39'
  'rgba(184, 48, 106' = 'rgba(122, 89, 38'
  '#e8587f'           = '#b8912f'
  # Pêche/abricot -> champagne / sable doré
  'rgba(255, 196, 140' = 'rgba(228, 200, 120'
  'rgba(255, 216, 184' = 'rgba(232, 214, 170'
  'rgba(255, 140, 120' = 'rgba(212, 175, 55'
  '#ffc58a'           = '#e6d3a3'
  '#ff9db8'           = '#b9bcc2'
  # Blancs chauds (teinte rosée -> neutre chaude)
  'rgba(255, 240, 232' = 'rgba(246, 243, 235'
  'rgba(255, 243, 236' = 'rgba(247, 244, 238'
  'rgba(255, 248, 241' = 'rgba(250, 248, 244'
  '#fff3ec'           = '#f7f4ee'
  '#fff8f1'           = '#faf8f4'
  '#fcebdd'           = '#f2ede3'
  '#fffdfb'           = '#fffdf7'
  '#fff0dc'           = '#f6efdd'
  # Anciennes vives éparpillées -> équivalents doré/bronze
  '#f2a33a'           = '#c9a227'
  '#ff9966'           = '#e2c56b'
  '#d2501f'           = '#a87f35'
  '#b83a14'           = '#6d4c1f'
  '#e8643a'           = '#d4af37'
  '#ffb15c'           = '#e9d9a8'
  '#b3261e'           = '#a33b2a'
  '#6e5560'           = '#6b6c70'
  # Lightbox aubergine -> noir
  'rgba(34, 14, 28'   = 'rgba(18, 14, 12'
}

$utf8 = New-Object System.Text.UTF8Encoding($false)
$files = Get-ChildItem -Path $root -Recurse -Include *.vue, *.css
$changed = 0
foreach ($f in $files) {
  $c = [System.IO.File]::ReadAllText($f.FullName)
  $orig = $c
  foreach ($k in $map.Keys) { $c = $c.Replace($k, $map[$k]) }
  if ($c -ne $orig) {
    [System.IO.File]::WriteAllText($f.FullName, $c, $utf8)
    Write-Output ("MAJ  " + $f.FullName.Substring($root.Length + 1))
    $changed++
  }
}
Write-Output ("--- " + $changed + " fichier(s) modifie(s) sur " + $files.Count)
