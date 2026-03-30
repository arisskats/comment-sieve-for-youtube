param(
  [string]$OutputDir = "src/assets/icons"
)

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$destination = Join-Path $root $OutputDir

New-Item -ItemType Directory -Force -Path $destination | Out-Null

$sizes = @(16, 32, 48, 128)
$background = [System.Drawing.Color]::FromArgb(255, 210, 58, 31)
$panel = [System.Drawing.Color]::FromArgb(255, 246, 241, 233)
$line = [System.Drawing.Color]::FromArgb(255, 48, 36, 31)
$accent = [System.Drawing.Color]::FromArgb(255, 255, 206, 92)

function New-RoundedRectPath {
  param(
    [float]$X,
    [float]$Y,
    [float]$Width,
    [float]$Height,
    [float]$Radius
  )

  $diameter = $Radius * 2
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddArc($X, $Y, $diameter, $diameter, 180, 90)
  $path.AddArc($X + $Width - $diameter, $Y, $diameter, $diameter, 270, 90)
  $path.AddArc($X + $Width - $diameter, $Y + $Height - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($X, $Y + $Height - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

foreach ($size in $sizes) {
  $bitmap = New-Object System.Drawing.Bitmap $size, $size
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.Clear([System.Drawing.Color]::Transparent)

  $canvas = [float]$size
  $tilePath = New-RoundedRectPath ($canvas * 0.08) ($canvas * 0.08) ($canvas * 0.84) ($canvas * 0.84) ($canvas * 0.2)
  $graphics.FillPath((New-Object System.Drawing.SolidBrush $background), $tilePath)

  $inset = $canvas * 0.22
  $funnelWidth = $canvas - ($inset * 2)
  $top = $canvas * 0.24
  $bottom = $canvas * 0.72
  $midX = $canvas / 2
  $neckWidth = $canvas * 0.15

  $funnel = New-Object System.Drawing.Drawing2D.GraphicsPath
  $funnel.AddPolygon(@(
      [System.Drawing.PointF]::new($inset, $top),
      [System.Drawing.PointF]::new($inset + $funnelWidth, $top),
      [System.Drawing.PointF]::new($midX + ($neckWidth / 2), $canvas * 0.5),
      [System.Drawing.PointF]::new($midX + ($neckWidth / 2), $bottom),
      [System.Drawing.PointF]::new($midX - ($neckWidth / 2), $bottom),
      [System.Drawing.PointF]::new($midX - ($neckWidth / 2), $canvas * 0.5)
    ))

  $graphics.FillPath((New-Object System.Drawing.SolidBrush $panel), $funnel)

  $strokeWidth = [Math]::Max(1.25, $canvas * 0.055)
  $stroke = New-Object System.Drawing.Pen $line, $strokeWidth
  $stroke.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  $graphics.DrawPath($stroke, $funnel)

  $slotPen = New-Object System.Drawing.Pen $accent, ([Math]::Max(1.0, $canvas * 0.05))
  $slotPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $slotPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $graphics.DrawLine($slotPen, $canvas * 0.3, $canvas * 0.33, $canvas * 0.7, $canvas * 0.33)
  $graphics.DrawLine($slotPen, $canvas * 0.36, $canvas * 0.45, $canvas * 0.64, $canvas * 0.45)

  $filePath = Join-Path $destination "icon-$size.png"
  $bitmap.Save($filePath, [System.Drawing.Imaging.ImageFormat]::Png)

  $slotPen.Dispose()
  $stroke.Dispose()
  $funnel.Dispose()
  $tilePath.Dispose()
  $graphics.Dispose()
  $bitmap.Dispose()
}
