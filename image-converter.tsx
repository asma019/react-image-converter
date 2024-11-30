'use client'

import React, { useState, useRef, useEffect } from 'react'
import { FileImage, UploadCloud, RefreshCcw, Download, X, AlertTriangle, Sun, Moon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

const ImageConverter = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [convertedImage, setConvertedImage] = useState<{ dataUrl: string; filename: string } | null>(null)
  const [sourceFormat, setSourceFormat] = useState('')
  const [targetFormat, setTargetFormat] = useState<string>('png')
  const [error, setError] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark')
    } else {
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
      setIsDarkMode(prefersDarkMode)
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
  }

  const supportedFormats = [
    { ext: 'jpeg', name: 'JPEG', description: 'Best for photographs' },
    { ext: 'png', name: 'PNG', description: 'Best for graphics with transparency' },
    { ext: 'webp', name: 'WebP', description: 'Lightweight web format' },
    { ext: 'gif', name: 'GIF', description: 'Supports animations' },
    { ext: 'bmp', name: 'BMP', description: 'Uncompressed, large file size' }
  ]

  const validateFile = (file: File) => {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp']

    if (!file) {
      setError('No file selected')
      return false
    }

    if (file.size > maxSize) {
      setError('File is too large. Maximum 10MB allowed.')
      return false
    }

    if (!validTypes.includes(file.type)) {
      setError('Unsupported file type')
      return false
    }

    setError(null)
    return true
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && validateFile(file)) {
      setSelectedFile(file)
      setSourceFormat(file.name.split('.').pop()?.toLowerCase() || '')
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    const file = event.dataTransfer.files[0]
    if (file && validateFile(file)) {
      setSelectedFile(file)
      setSourceFormat(file.name.split('.').pop()?.toLowerCase() || '')
    }
  }

  const convertImage = async () => {
    if (!selectedFile) return

    try {
      const reader = new FileReader()
      reader.onloadend = () => {
        const canvas = document.createElement('canvas')
        const img = new Image()
        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.drawImage(img, 0, 0)
            const convertedDataUrl = canvas.toDataURL(`image/${targetFormat}`)
            setConvertedImage({
              dataUrl: convertedDataUrl,
              filename: `converted_image.${targetFormat}`
            })
          }
        }
        img.src = reader.result as string
      }
      reader.readAsDataURL(selectedFile)
    } catch (error) {
      setError('Conversion failed')
      console.error('Conversion error:', error)
    }
  }

  const downloadImage = () => {
    if (!convertedImage) return

    const link = document.createElement('a')
    link.href = convertedImage.dataUrl
    link.download = convertedImage.filename
    link.click()
  }

  const clearFile = () => {
    setSelectedFile(null)
    setConvertedImage(null)
    setSourceFormat('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
      <Card className="w-full max-w-xl relative">
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center justify-center">
            <FileImage className="mr-3 text-primary" size={32} />
            Image Converter
          </CardTitle>
          <p className="text-center text-muted-foreground mt-2">
            Convert images quickly and easily
          </p>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={toggleTheme}
            variant="outline"
            size="icon"
            className="absolute top-4 right-4"
          >
            {isDarkMode ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
          </Button>

          {error && (
            <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded-lg mb-4 flex items-center">
              <AlertTriangle className="mr-3 h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <div 
            className="border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 hover:border-primary"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <Input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              className="hidden"
              onChange={handleFileChange}
              id="file-upload"
            />
            <Label htmlFor="file-upload" className="cursor-pointer block">
              <UploadCloud className="mx-auto mb-4 text-muted-foreground hover:text-primary transition" size={48} />
              <p className="text-muted-foreground mb-2">
                Drag & drop or <span className="text-primary underline">browse</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Supports: JPEG, PNG, WebP, GIF, BMP (Max 10MB)
              </p>
            </Label>

            {selectedFile && (
              <div className="mt-4 flex items-center justify-between p-3 rounded-lg bg-muted">
                <div className="flex items-center">
                  <FileImage className="mr-3 text-primary" />
                  <span className="text-sm">{selectedFile.name}</span>
                </div>
                <Button 
                  onClick={clearFile}
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive/90"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source-format">Source Format</Label>
              <Input 
                id="source-format"
                type="text" 
                value={sourceFormat || 'Auto Detected'} 
                readOnly 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target-format">Target Format</Label>
              <Select onValueChange={(value) => setTargetFormat(value)}>
                <SelectTrigger id="target-format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  {supportedFormats.map(format => (
                    <SelectItem key={format.ext} value={format.ext}>
                      {format.name} - {format.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={convertImage}
            disabled={!selectedFile || !!error}
            className="w-full mt-6"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Convert Image
          </Button>

          {convertedImage && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold">Converted Image Preview</h3>
              <div className="max-h-80 overflow-hidden rounded-lg shadow-md">
                <img 
                  src={convertedImage.dataUrl} 
                  alt="Converted" 
                  className="w-full object-contain"
                />
              </div>
              <Button 
                onClick={downloadImage}
                className="w-full"
                variant="secondary"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Converted Image
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ImageConverter

