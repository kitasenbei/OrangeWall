import { useState } from "react"
import { Globe, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export function MetaPage() {
  const [title, setTitle] = useState("My Website")
  const [description, setDescription] = useState("Welcome to my awesome website")
  const [keywords, setKeywords] = useState("website, awesome, example")
  const [author, setAuthor] = useState("John Doe")
  const [ogImage, setOgImage] = useState("https://example.com/image.jpg")
  const [twitterHandle, setTwitterHandle] = useState("@johndoe")
  const [url, setUrl] = useState("https://example.com")
  const [copied, setCopied] = useState(false)

  const metaTags = `<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${description}">
<meta name="keywords" content="${keywords}">
<meta name="author" content="${author}">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${ogImage}">

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="${url}">
<meta property="twitter:title" content="${title}">
<meta property="twitter:description" content="${description}">
<meta property="twitter:image" content="${ogImage}">
<meta name="twitter:creator" content="${twitterHandle}">`

  const copy = () => {
    navigator.clipboard.writeText(metaTags)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Meta Tag Generator</h1><p className="text-sm text-muted-foreground">Generate SEO and social media meta tags</p></div>
        <Button onClick={copy}>{copied ? <Check className="size-4 mr-2 text-green-500" /> : <Copy className="size-4 mr-2" />}Copy Tags</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2"><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} /></div>
          <div className="space-y-2"><Label>Description</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} /></div>
          <div className="space-y-2"><Label>Keywords</Label><Input value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="comma, separated, keywords" /></div>
          <div className="space-y-2"><Label>Author</Label><Input value={author} onChange={e => setAuthor(e.target.value)} /></div>
          <div className="space-y-2"><Label>URL</Label><Input value={url} onChange={e => setUrl(e.target.value)} type="url" /></div>
          <div className="space-y-2"><Label>OG Image URL</Label><Input value={ogImage} onChange={e => setOgImage(e.target.value)} type="url" /></div>
          <div className="space-y-2"><Label>Twitter Handle</Label><Input value={twitterHandle} onChange={e => setTwitterHandle(e.target.value)} /></div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Generated Meta Tags</Label>
            <pre className="bg-muted p-4 rounded-lg text-xs font-mono overflow-auto max-h-[500px]">{metaTags}</pre>
          </div>

          <div className="bg-card border rounded-lg p-4">
            <Label className="mb-3 block flex items-center gap-2"><Globe className="size-4" />Preview</Label>
            <div className="space-y-2">
              <p className="text-blue-500 text-lg">{title}</p>
              <p className="text-green-600 text-sm">{url}</p>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
