import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, ArrowRight, MapPin } from 'lucide-react';
import { mapAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function CulturalHub() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mapAPI.getArticles().then(r => setArticles(r.data.articles || r.data || []))
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-saffron-100 rounded-full text-saffron-700 text-xs font-medium mb-4">
          <BookOpen className="w-3.5 h-3.5" /> Cultural Heritage
        </div>
        <h1 className="section-heading">Stories Behind the Craft</h1>
        <p className="section-subheading max-w-2xl mx-auto">
          Discover the rich cultural heritage, traditional techniques, and artisan stories from across India's diverse craft landscape.
        </p>
      </div>

      {/* Featured article */}
      {articles.length > 0 && (
        <Link to={`/cultural-hub/${articles[0].slug}`}
          className="block card overflow-hidden mb-10 group">
          <div className="grid md:grid-cols-2">
            <div className="h-64 md:h-auto bg-gradient-to-br from-terracotta-400 to-terracotta-600 relative overflow-hidden">
              {articles[0].cover_image ? (
                <img src={articles[0].cover_image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="absolute inset-0 bg-texture-subtle opacity-20" />
              )}
              <div className="absolute top-4 left-4">
                <span className="badge bg-white/90 text-terracotta-600">{articles[0].category || 'Featured'}</span>
              </div>
            </div>
            <div className="p-8 flex flex-col justify-center">
              <h2 className="font-display text-2xl font-bold text-gray-900 mb-3 group-hover:text-terracotta-600 transition-colors">
                {articles[0].title}
              </h2>
              <p className="text-gray-500 leading-relaxed line-clamp-3 mb-4">{articles[0].excerpt || articles[0].summary}</p>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                {articles[0].read_time && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {articles[0].read_time} min read</span>}
                {articles[0].state && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {articles[0].state}</span>}
              </div>
              <span className="inline-flex items-center gap-1 text-terracotta-600 font-medium text-sm mt-4 group-hover:gap-2 transition-all">
                Read Article <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </Link>
      )}

      {/* Articles grid */}
      {articles.length > 1 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.slice(1).map(article => (
            <Link key={article.id || article.slug} to={`/cultural-hub/${article.slug}`}
              className="card-hover group">
              <div className="h-48 bg-gradient-to-br from-cream-200 to-cream-300 relative overflow-hidden">
                {article.cover_image ? (
                  <img src={article.cover_image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-10 h-10 text-cream-400" />
                  </div>
                )}
                {article.category && (
                  <span className="absolute top-3 left-3 badge bg-white/90 text-gray-600 text-[10px]">{article.category}</span>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-semibold text-gray-800 mb-2 group-hover:text-terracotta-600 transition-colors line-clamp-3 min-h-[3.5rem]">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-3 mb-3">{article.excerpt || article.summary}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-3">
                    {article.read_time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {article.read_time} min</span>}
                    {article.state && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {article.state}</span>}
                  </div>
                  <span className="text-terracotta-500">Read →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {articles.length === 0 && (
        <div className="text-center py-16">
          <BookOpen className="w-14 h-14 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No articles yet</p>
          <p className="text-gray-400 text-sm mt-1">Cultural stories coming soon</p>
        </div>
      )}
    </div>
  );
}
