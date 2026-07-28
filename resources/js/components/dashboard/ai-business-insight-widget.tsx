import { useEffect, useState } from 'react';
import axios from 'axios';
import { Sparkles, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function AiBusinessInsightWidget() {
    const [insight, setInsight] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInsight = async () => {
            try {
                const res = await axios.get('/api/ai/business-insight');
                setInsight(res.data.insight);
            } catch (error) {
                console.error('Failed to fetch AI insight', error);
                setInsight('Gagal memuat insight dari AI Copilot hari ini.');
            } finally {
                setLoading(false);
            }
        };

        fetchInsight();
    }, []);

    return (
        <Card className="bg-gradient-to-br from-indigo-900 to-purple-900 border-indigo-800 text-white shadow-lg overflow-hidden relative">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-5 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 bg-fuchsia-500 opacity-10 rounded-full blur-xl"></div>
            
            <CardContent className="p-5 relative z-10">
                <div className="flex items-start gap-4">
                    <div className="bg-white/10 p-2.5 rounded-lg shrink-0 mt-1 shadow-inner border border-white/5">
                        {loading ? (
                            <Loader2 className="h-6 w-6 text-fuchsia-300 animate-spin" />
                        ) : (
                            <Sparkles className="h-6 w-6 text-fuchsia-300" />
                        )}
                    </div>
                    
                    <div className="flex-1 space-y-1.5">
                        <h3 className="text-sm font-bold text-indigo-100 uppercase tracking-wider flex items-center gap-2">
                            AI Business Insight
                            <span className="bg-fuchsia-500/20 text-fuchsia-200 text-[10px] px-2 py-0.5 rounded-full border border-fuchsia-500/30">Beta</span>
                        </h3>
                        {loading ? (
                            <div className="space-y-2 animate-pulse pt-1">
                                <div className="h-3 bg-white/10 rounded w-full"></div>
                                <div className="h-3 bg-white/10 rounded w-5/6"></div>
                                <div className="h-3 bg-white/10 rounded w-4/6"></div>
                            </div>
                        ) : (
                            <p className="text-sm text-indigo-50/90 leading-relaxed font-medium">
                                {insight}
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
