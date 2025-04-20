import { NextResponse } from "next/server"
import { chromium } from "playwright"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")

  if (!query) {
    return NextResponse.json({ error: "请提供搜索查询" }, { status: 400 })
  }

  try {
    const browser = await chromium.launch()
    const page = await browser.newPage()
    
    // 访问 Bing 搜索页面
    await page.goto(`https://www.bing.com/search?q=${encodeURIComponent(query)}`)
    
    // 等待搜索结果加载
    await page.waitForSelector("#b_results")
    
    // 获取搜索结果
    const results = await page.evaluate(() => {
      const items = document.querySelectorAll("#b_results > li")
      return Array.from(items).map(item => {
        const titleElement = item.querySelector("h2 a")
        return {
          title: titleElement?.textContent?.trim() || "",
          link: titleElement?.getAttribute("href") || ""
        }
      }).filter(result => result.title && result.link)
    })

    await browser.close()

    return NextResponse.json({ results })
  } catch (error) {
    console.error("搜索出错:", error)
    return NextResponse.json(
      { error: "搜索过程中出现错误" },
      { status: 500 }
    )
  }
} 