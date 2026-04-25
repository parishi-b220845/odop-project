import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Calendar, BookOpen } from 'lucide-react';
import { mapAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**')
      ? <strong key={i} className="font-semibold text-gray-900">{p.slice(2, -2)}</strong>
      : p
  );
}

function renderMarkdown(content) {
  const blocks = content.split('\n\n');
  const elements = [];
  let listItems = [];

  const flushList = () => {
    if (listItems.length) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc list-outside ml-5 mb-5 space-y-1.5">
          {listItems.map((li, i) => (
            <li key={i} className="text-gray-700 leading-relaxed">{renderInline(li)}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  blocks.forEach((block, i) => {
    // Bullet list block
    if (block.trim().split('\n').every(l => l.trim().startsWith('- '))) {
      flushList();
      block.trim().split('\n').forEach(l => listItems.push(l.replace(/^-\s*/, '')));
      flushList();
      return;
    }
    flushList();

    if (block.startsWith('# ')) {
      elements.push(<h1 key={i} className="font-display text-2xl font-bold text-gray-900 mt-8 mb-3">{block.slice(2)}</h1>);
    } else if (block.startsWith('## ')) {
      elements.push(<h2 key={i} className="font-display text-xl font-semibold text-terracotta-700 mt-7 mb-2">{block.slice(3)}</h2>);
    } else if (block.startsWith('### ')) {
      elements.push(<h3 key={i} className="font-semibold text-gray-800 mt-5 mb-2">{block.slice(4)}</h3>);
    } else if (block.trim()) {
      // Mixed line block — some may be list items, some prose
      const lines = block.trim().split('\n');
      const allList = lines.every(l => l.trim().startsWith('- '));
      const anyList = lines.some(l => l.trim().startsWith('- '));
      if (allList) {
        lines.forEach(l => listItems.push(l.replace(/^-\s*/, '')));
        flushList();
      } else if (anyList) {
        lines.forEach((l, li) => {
          if (l.trim().startsWith('- ')) {
            listItems.push(l.replace(/^-\s*/, ''));
          } else {
            flushList();
            if (l.trim()) elements.push(<p key={`${i}-${li}`} className="text-gray-700 leading-relaxed mb-4">{renderInline(l)}</p>);
          }
        });
        flushList();
      } else {
        elements.push(<p key={i} className="text-gray-700 leading-relaxed mb-5">{renderInline(block.trim())}</p>);
      }
    }
  });
  flushList();
  return elements;
}

export default function ArticleDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mapAPI.getArticle(slug).then(r => setArticle(r.data.article || r.data))
      .catch(() => {}).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <LoadingSpinner />;
  if (!article) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <BookOpen className="w-14 h-14 text-gray-200 mb-4" />
      <p className="text-gray-400 text-lg">Article not found</p>
      <Link to="/cultural-hub" className="btn-outline mt-4 text-sm">Back to Cultural Hub</Link>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link to="/cultural-hub" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-terracotta-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Cultural Hub
      </Link>

      {/* Cover */}
      {article.cover_image && (
        <div className="h-72 rounded-xl overflow-hidden mb-8">
          <img src={article.cover_image} alt={article.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-3 mb-4 text-xs text-gray-400">
        {article.category && <span className="badge-saffron">{article.category}</span>}
        {article.read_time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {article.read_time} min read</span>}
        {article.state && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {article.state}</span>}
        {article.created_at && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(article.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
      </div>

      <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">{article.title}</h1>

      {article.excerpt && <p className="text-lg text-gray-500 leading-relaxed mb-8 border-l-4 border-terracotta-300 pl-4">{article.excerpt}</p>}

      {/* Article body */}
      <article className="max-w-none">
        {renderMarkdown(article.content || article.body || '')}
      </article>

      {/* Related products */}
      {article.state && (
        <div className="mt-12 p-6 bg-cream-100 rounded-xl">
          <h3 className="font-display text-lg font-semibold text-gray-800 mb-2">Explore Products from {article.state}</h3>
          <p className="text-sm text-gray-500 mb-4">Discover authentic crafts from the region featured in this article.</p>
          <Link to={`/products?state=${encodeURIComponent(article.state)}`} className="btn-primary text-sm">
            Browse Products
          </Link>
        </div>
      )}
    </div>
  );
}
