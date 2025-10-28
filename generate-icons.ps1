# Icon Generator Script for Bulk Email Personalizer
# This creates simple placeholder icons

Add-Type -AssemblyName System.Drawing

$iconFolder = "icons"
$sizes = @(16, 48, 128)

# Main brand color - Blue
$brandColor = [System.Drawing.Color]::FromArgb(59, 130, 246)
$whiteColor = [System.Drawing.Color]::White
$darkBlue = [System.Drawing.Color]::FromArgb(30, 64, 175)

Write-Host "Generating icons for Bulk Email Personalizer..." -ForegroundColor Cyan

foreach ($size in $sizes) {
    Write-Host "Creating ${size}x${size} icon..." -ForegroundColor Yellow
    
    # Create bitmap
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    
    # Fill background with brand color
    $graphics.Clear($brandColor)
    
    # Calculate envelope dimensions
    $padding = [Math]::Floor($size * 0.15)
    $envWidth = $size - ($padding * 2)
    $envHeight = [Math]::Floor($envWidth * 0.65)
    $x = $padding
    $y = [Math]::Floor(($size - $envHeight) / 2)
    
    # Draw envelope body (white rectangle)
    $whiteBrush = New-Object System.Drawing.SolidBrush($whiteColor)
    $graphics.FillRectangle($whiteBrush, $x, $y, $envWidth, $envHeight)
    
    # Draw envelope flap (light blue triangle)
    $lightBlue = [System.Drawing.Color]::FromArgb(224, 231, 255)
    $flapBrush = New-Object System.Drawing.SolidBrush($lightBlue)
    $points = @(
        [System.Drawing.Point]::new($x, $y),
        [System.Drawing.Point]::new($x + $envWidth / 2, $y + $envHeight * 0.4),
        [System.Drawing.Point]::new($x + $envWidth, $y)
    )
    $graphics.FillPolygon($flapBrush, $points)
    
    # Draw envelope outline
    $pen = New-Object System.Drawing.Pen($darkBlue, [Math]::Max(1, [Math]::Floor($size * 0.03)))
    $graphics.DrawRectangle($pen, $x, $y, $envWidth, $envHeight)
    
    # Draw flap lines
    $graphics.DrawLine($pen, $x, $y, $x + $envWidth / 2, $y + $envHeight * 0.4)
    $graphics.DrawLine($pen, $x + $envWidth / 2, $y + $envHeight * 0.4, $x + $envWidth, $y)
    
    # Save icon
    $outputPath = Join-Path $iconFolder "icon$size.png"
    $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    # Cleanup
    $graphics.Dispose()
    $bitmap.Dispose()
    $whiteBrush.Dispose()
    $flapBrush.Dispose()
    $pen.Dispose()
    
    Write-Host "✓ Created $outputPath" -ForegroundColor Green
}

Write-Host ""
Write-Host "All icons generated successfully!" -ForegroundColor Green
Write-Host "You can now load the extension in Chrome." -ForegroundColor Cyan
