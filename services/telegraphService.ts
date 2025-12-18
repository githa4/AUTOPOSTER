
// Telegraph is the standard "Long Read" platform for Telegram.
// It supports Instant View natively and has a free API.

const TELEGRAPH_API_URL = 'https://api.telegra.ph';
const PROXY_URL = "https://corsproxy.io/?"; 

interface TelegraphNode {
    tag?: string;
    attrs?: Record<string, string>;
    children?: (TelegraphNode | string)[];
}

// Map standard HTML tags to Telegraph supported tags
const TAG_MAP: Record<string, string> = {
    'h1': 'h3',
    'h2': 'h3',
    'h3': 'h3',
    'h4': 'h4',
    'h5': 'h4',
    'h6': 'h4',
    'p': 'p',
    'b': 'b',
    'strong': 'b',
    'i': 'i',
    'em': 'i',
    'u': 'u',
    's': 's',
    'strike': 's',
    'del': 's',
    'a': 'a',
    'blockquote': 'blockquote',
    'code': 'code',
    'pre': 'pre',
    'ul': 'ul',
    'ol': 'ol',
    'li': 'li',
    'img': 'img',
    'br': 'br',
    'hr': 'hr'
};

// Helper to upload image to Telegraph (Requires Proxy due to CORS)
const uploadImageToTelegraph = async (base64: string): Promise<string | null> => {
    try {
        // Convert Base64 to Blob
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const blob = new Blob([new Uint8Array(byteNumbers)], { type: 'image/png' });
        
        const formData = new FormData();
        formData.append('file', blob, 'image.png');

        // Use CORS proxy to hit telegra.ph/upload
        const uploadUrl = `${PROXY_URL}${encodeURIComponent('https://telegra.ph/upload')}`;
        
        const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) return null;

        const data = await response.json();
        // Result is usually [{ src: '/file/...' }]
        if (Array.isArray(data) && data[0]?.src) {
            return `https://telegra.ph${data[0].src}`;
        }
        return null;
    } catch (e) {
        console.error("Failed to upload image to Telegraph", e);
        return null;
    }
};

// Advanced DOM-based parser for high-fidelity rendering
const domToTelegraph = (node: Node): TelegraphNode | string | null => {
    // 1. Text Node
    if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        // CRITICAL FIX: Ignore pure whitespace nodes to prevent empty list items and layout shifts
        if (!text || text.trim().length === 0) return null;
        return text;
    }

    // 2. Element Node
    if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const tagName = element.tagName.toLowerCase();
        
        // Skip script/style
        if (tagName === 'script' || tagName === 'style') return null;

        // Telegraph Node Structure
        const tNode: TelegraphNode = {};
        
        // Handle Tags
        if (TAG_MAP[tagName]) {
            tNode.tag = TAG_MAP[tagName];
        } else {
            // Unwrap unknown block elements (div, article) to p if they contain text
            if (['div', 'section', 'article', 'main', 'header', 'footer'].includes(tagName)) {
                 tNode.tag = 'p'; 
            }
        }

        // Handle Attributes
        if (tagName === 'a' && element.hasAttribute('href')) {
            tNode.attrs = { href: element.getAttribute('href')! };
        }
        if (tagName === 'img' && element.hasAttribute('src')) {
            tNode.attrs = { src: element.getAttribute('src')! };
        }

        // Handle Children
        const children: (TelegraphNode | string)[] = [];
        
        element.childNodes.forEach(child => {
            const processedChild = domToTelegraph(child);
            if (processedChild) {
                children.push(processedChild);
            }
        });

        // SPECIAL HANDLING: LISTS
        // Telegraph is strict: <ul> can ONLY contain <li>. Text nodes inside <ul> break the view.
        if (tNode.tag === 'ul' || tNode.tag === 'ol') {
             // Filter children: Keep only Objects (Nodes) that are <li> tags. Drop raw strings.
             const cleanChildren = children.filter(c => typeof c !== 'string' && c.tag === 'li');
             if (cleanChildren.length > 0) {
                 tNode.children = cleanChildren;
             } else {
                 return null; // Empty list
             }
        } else {
            if (children.length > 0) {
                tNode.children = children;
            } else if (tNode.tag === 'br' || tNode.tag === 'img' || tNode.tag === 'hr') {
                // self closing, allowed
            } else {
                // Empty tags (like <b></b>) are redundant
                return null; 
            }
        }

        // If generic wrapper but no tag assigned (and not filtered above), simplify
        if (!tNode.tag) {
             return null;
        }

        return tNode;
    }

    return null;
};

// Main Conversion Function
const htmlToTelegraphNodes = (html: string): TelegraphNode[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const body = doc.body;
    
    const nodes: TelegraphNode[] = [];

    body.childNodes.forEach(child => {
        const processed = domToTelegraph(child);
        if (processed) {
            // If the root returns a raw string (rare at root level), wrap in p
            if (typeof processed === 'string') {
                if (processed.trim()) nodes.push({ tag: 'p', children: [processed] });
            } else {
                nodes.push(processed);
            }
        }
    });

    return nodes;
};

export const createTelegraphPage = async (
    title: string,
    contentHtml: string,
    authorName: string = 'AutoPost.ai',
    imageBase64?: string | null
): Promise<string> => {
    try {
        // 1. Create Account (Cached)
        let accessToken = localStorage.getItem('telegraph_token');
        
        if (!accessToken) {
            const createAccountUrl = `${TELEGRAPH_API_URL}/createAccount?short_name=AutoPost&author_name=${encodeURIComponent(authorName)}`;
            const accRes = await fetch(createAccountUrl);
            const accData = await accRes.json();
            
            if (!accData.ok) throw new Error('Failed to create Telegraph account');
            accessToken = accData.result.access_token;
            localStorage.setItem('telegraph_token', accessToken!);
        }

        // 2. Format Content using DOM Parser
        const contentNodes = htmlToTelegraphNodes(contentHtml);
        
        // 3. Upload and Insert Image (If provided)
        if (imageBase64) {
            const imageUrl = await uploadImageToTelegraph(imageBase64);
            if (imageUrl) {
                // Insert at the top
                const imgNode: TelegraphNode = {
                    tag: 'img',
                    attrs: { src: imageUrl }
                };
                // Add a caption text if needed? No, just image is fine.
                contentNodes.unshift(imgNode);
            }
        }

        // Validate nodes
        if (contentNodes.length === 0) {
            contentNodes.push({ tag: 'p', children: ['(Content generation error or empty input)'] });
        }

        const contentJson = JSON.stringify(contentNodes);

        // 4. Create Page
        const createPageUrl = `${TELEGRAPH_API_URL}/createPage`;
        const formData = new FormData();
        formData.append('access_token', accessToken!);
        formData.append('title', title);
        formData.append('content', contentJson);
        formData.append('return_content', 'false');

        const pageRes = await fetch(createPageUrl, {
            method: 'POST',
            body: formData
        });
        
        const pageData = await pageRes.json();
        
        if (!pageData.ok) {
            if (pageData.error === 'ACCESS_TOKEN_INVALID') {
                localStorage.removeItem('telegraph_token');
                return createTelegraphPage(title, contentHtml, authorName, imageBase64);
            }
            throw new Error(`Telegraph Error: ${pageData.error}`);
        }

        return pageData.result.url;

    } catch (e: any) {
        console.error("Telegraph Service Error", e);
        throw new Error("Failed to create Long-Read link: " + e.message);
    }
};
