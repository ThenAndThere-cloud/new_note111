import { Message } from '../types/chat';

const API_KEY = 'sk-eudcwozxipqucmymqwwcphujvaduleuykwsbgqjiajpjkloh';
const API_URL = 'https://api.siliconflow.cn/v1/chat/completions';

export async function chatWithLLM(messages: Message[], context?: string) {
  console.log('=== 开始 LLM 调用 ===');
  console.log('上下文信息:', context);
  console.log('历史消息:', messages);

  try {
    console.log('准备发送请求到硅基流 API...');
    const requestBody = {
      model: 'Qwen/Qwen2.5-7B-Instruct',
      messages: [
        ...(context ? [{
          role: 'system',
          content: `以下是上下文信息：\n${context}\n请基于以上上下文回答用户的问题。`
        }] : []),
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 2000,
    };
    console.log('请求体:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('收到 API 响应，状态码:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API 请求失败，错误信息:', errorText);
      throw new Error(`LLM API 请求失败: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('API 响应数据:', JSON.stringify(data, null, 2));
    
    const content = data.choices[0].message.content;
    console.log('生成的回答:', content);
    console.log('=== LLM 调用完成 ===');
    
    return content;
  } catch (error) {
    console.error('LLM 调用过程中发生错误:', error);
    throw error;
  }
}

// 批量处理请求
export async function batch_process(prompts: string[], batch_size: number = 10) {
  const results: string[] = [];
  for (let i = 0; i < prompts.length; i += batch_size) {
    const batch = prompts.slice(i, i + batch_size);
    // 检查缓存
    const cached_results: string[] = [];
    for (const prompt of batch) {
      const key = hashlib.createHash('md5').update(prompt).digest('hex');
      if (cache.has(key)) {
        cached_results.push(cache.get(key));
      } else {
        // 调用API获取结果
        const result = await chatWithLLM([{ role: 'user', content: prompt }], undefined);
        cache.set(key, result, expire=3600);
        cached_results.push(result);
      }
    }
    results.push(...cached_results);
  }
  return results;
} 