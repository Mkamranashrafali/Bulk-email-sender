# Simple Icon Generator
Add-Type -AssemblyName System.Drawing

$sizes = @(16, 48, 128)
$color = [System.Drawing.Color]::FromArgb(59, 130, 246)

foreach ($size in $sizes) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $gfx = [System.Drawing.Graphics]::FromImage($bmp)
    $gfx.Clear($color)
    
    # White envelope
    $white = [System.Drawing.Color]::White
    $brush = New-Object System.Drawing.SolidBrush($white)
    $pad = [int]($size * 0.2)
    $w = $size - ($pad * 2)
    $h = [int]($w * 0.6)
    $x = $pad
    $y = [int](($size - $h) / 2)
    $gfx.FillRectangle($brush, $x, $y, $w, $h)
    
    # Border
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::Black, 2)
    $gfx.DrawRectangle($pen, $x, $y, $w, $h)
    
    $bmp.Save("icons\icon$size.png")
    $gfx.Dispose()
    $bmp.Dispose()
    Write-Host "Created icon$size.png"
}
