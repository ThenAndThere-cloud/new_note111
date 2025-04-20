"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface SearchResult {
  title: string
  link: string
}

export function BingSearchDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/bing-search?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      setResults(data.results)
    } catch (error) {
      console.error("搜索出错:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="mt-4">
          <Search className="mr-2 h-4 w-4" />
          搜索 Bing
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Bing 搜索</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2">
          <Input
            placeholder="输入搜索内容..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? "搜索中..." : "搜索"}
          </Button>
        </div>
        <div className="mt-4 space-y-2">
          {results.map((result, index) => (
            <div key={index} className="p-2 border rounded">
              <a href={result.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {result.title}
              </a>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
} 