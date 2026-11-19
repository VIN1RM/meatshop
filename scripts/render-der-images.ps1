param([string]$MermaidCommand = 'mmdc', [string]$PuppeteerConfig = '')
$ErrorActionPreference = 'Stop'
$repo = Split-Path $PSScriptRoot -Parent
$docs = Join-Path $repo 'docs'

# Install separately with: npm install --global @mermaid-js/mermaid-cli@12.2.0
# The renderer uses Mermaid's ELK layout and writes no application files.
function Export-Der([string]$source, [string]$output) {
    $extra = @()
    if ($PuppeteerConfig) { $extra = @('-p', $PuppeteerConfig) }
    & $MermaidCommand -i $source -o $output -b white -s 1 @extra
    if ($LASTEXITCODE -ne 0) { throw "Mermaid rendering failed: $source" }
}
Export-Der (Join-Path $docs 'DER_ATUALIZADO.mmd') (Join-Path $docs 'DER_COMPLETO.svg')
$mermaidPath = (Get-Command $MermaidCommand).Source
node (Join-Path $PSScriptRoot 'der-svg-to-png.cjs') (Join-Path $docs 'DER_COMPLETO.svg') (Join-Path $docs 'DER_COMPLETO.png') $mermaidPath $PuppeteerConfig
if ($LASTEXITCODE -ne 0) { throw 'PNG rendering failed' }
Get-ChildItem (Join-Path $docs 'der') -Filter '*.mmd' | ForEach-Object {
    Export-Der $_.FullName ([IO.Path]::ChangeExtension($_.FullName, '.svg'))
}
