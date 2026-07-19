import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldCheck, Video, Clock, XCircle, CheckCircle, Bot, Scale, BrainCircuit } from 'lucide-react';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function LiveVisionTab() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inferenceResult, setInferenceResult] = useState(null);
  const [alertTriggered, setAlertTriggered] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const [qaInput, setQaInput] = useState("");
  const [qaLoading, setQaLoading] = useState(false);

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!qaInput.trim() || !inferenceResult) return;
    
    setQaLoading(true);
    const userMsg = qaInput;
    setQaInput("");
    
    // Append user question instantly to transcript
    const newTranscript = [...inferenceResult.transcript, { role: 'user', content: userMsg }];
    setInferenceResult({ ...inferenceResult, transcript: newTranscript });
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `Regarding the recent inspection debate: ${userMsg}` })
      });
      const data = await response.json();
      setInferenceResult(prev => ({
        ...prev,
        transcript: [...prev.transcript, { role: 'chatbot_explainer', content: data.reply }]
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setQaLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setIsProcessing(true);
    setAlertTriggered(false);
    setEscalated(false);
    setInferenceResult(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('kitchen_id', 'KITCHEN-221');

    try {
      const response = await fetch('http://localhost:8000/api/v1/ingest-frame', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setInferenceResult(data.event);
      if (data.event.status !== 'compliant') {
        setAlertTriggered(true);
      }
      
      try {
        if (data.event && db) {
          await setDoc(doc(db, 'events', data.event.id), data.event);
        }
      } catch (fbError) {
        console.error('Failed to save event to frontend Firestore:', fbError);
      }
    } catch (err) {
      console.error('Error processing frame:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col items-center justify-center p-6 gap-8">
      
      {/* Controls */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-[-1rem] z-10">
        <h2 className="text-xl font-bold text-emerald-950">Live Vision Feed</h2>
        <div className="relative overflow-hidden">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <button className="bg-[#0A2647] text-white px-4 py-2 rounded font-bold shadow hover:bg-[#153C6E] transition-colors">
            {isProcessing ? 'Processing...' : 'Upload Frame'}
          </button>
        </div>
      </div>

      {/* Video Feed Container */}
      <div className="w-full max-w-4xl glass-panel relative overflow-hidden aspect-video border border-emerald-300 shadow-2xl flex-shrink-0">
        
        {previewUrl ? (
          <img src={previewUrl} alt="Uploaded Frame" className="absolute inset-0 w-full h-full object-cover z-0" />
        ) : (
        <div className="absolute inset-0 bg-emerald-50 opacity-80" style={{ backgroundImage: 'radial-gradient(circle at center, #1A2333 0%, #0B1120 100%)' }}>
          <motion.div 
            className="absolute inset-0 opacity-10"
            animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")', opacity: 0.15 }}
          />
        </div>
        )}

        {/* Live Badge */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-emerald-50/90 backdrop-blur-sm px-3 py-1.5 rounded text-emerald-950 font-bold tracking-widest text-sm border border-red-500/30">
          <motion.div 
            className="w-2 h-2 rounded-full bg-red-500"
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          LIVE : KITCHEN-221 (DADAR)
        </div>

        {/* Timestamp */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-emerald-50/90 backdrop-blur-sm px-3 py-1.5 rounded text-emerald-800 font-mono text-sm border border-emerald-200">
          <Clock className="w-4 h-4" />
          {new Date().toLocaleTimeString()}
        </div>

        {/* Base Bounding Boxes (Only when NO inference results exist) */}
        {!inferenceResult && !previewUrl && (
          <>
            <motion.div 
              className="absolute border-2 border-brand-green/70 z-10"
              style={{ width: '15%', height: '40%', top: '30%', left: '20%' }}
              animate={{ x: [0, 2, -1, 0], y: [0, -1, 1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <div className="bg-brand-green/70 text-white text-[10px] font-bold px-1 absolute -top-4 left-0">Person 0.97</div>
            </motion.div>

            <motion.div 
              className="absolute border-2 border-brand-green/70 z-10"
              style={{ width: '8%', height: '15%', top: '65%', left: '45%' }}
              animate={{ x: [0, -1, 1, 0], y: [0, 1, -1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              <div className="bg-brand-green/70 text-white text-[10px] font-bold px-1 absolute -top-4 left-0">Salad 0.88</div>
            </motion.div>
          </>
        )}

        {/* Dynamic Detections from Backend */}
        <AnimatePresence>
          {inferenceResult && inferenceResult.detections && inferenceResult.detections.map((det, idx) => {
            // bbox is [x_center, y_center, width, height] normalized (0-1)
            const [xc, yc, w, h] = det.bbox;
            const left = (xc - w/2) * 100;
            const top = (yc - h/2) * 100;
            const width = w * 100;
            const height = h * 100;
            const isViolation = det.class.includes('no_') || det.class === 'incorrect_mask';
            const colorClass = isViolation ? 'border-red-500' : 'border-brand-green/70';
            const bgClass = isViolation ? 'bg-red-500' : 'bg-brand-green/70';

            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`absolute border-2 z-10 ${colorClass}`}
                style={{ width: `${width}%`, height: `${height}%`, top: `${top}%`, left: `${left}%` }}
              >
                <div className={`${bgClass} text-white text-[10px] font-bold px-1 absolute -top-4 left-0 whitespace-nowrap`}>
                  {det.class} {(det.confidence).toFixed(2)}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Alert Card Bottom Area */}
      <div className="w-full max-w-4xl relative">
        <AnimatePresence>
          {alertTriggered && !escalated && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full bg-red-500/10 border border-red-500 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between shadow-[0_0_30px_rgba(239,68,68,0.2)] backdrop-blur-md gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-red-500 font-bold text-lg">
                    {inferenceResult?.status?.toUpperCase()} VIOLATION (Risk Score: {inferenceResult?.risk_score})
                  </h3>
                  <p className="text-emerald-800 text-sm">{inferenceResult?.justification || 'Vision Agent detected a compliance issue.'}</p>
                  {inferenceResult?.matched_rules?.length > 0 && (
                    <p className="text-emerald-800 text-xs mt-1 font-mono text-[#FF9933]">
                      Rules Broken: {inferenceResult.matched_rules.join(', ')}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setAlertTriggered(false)}
                  className="px-4 py-2 bg-white text-emerald-800 border border-emerald-200 rounded font-bold text-sm hover:bg-emerald-100 transition-colors"
                >
                  Dismiss
                </button>
                <button 
                  onClick={() => setEscalated(true)}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded font-bold text-sm transition-colors shadow-lg"
                >
                  Escalate to Inspector
                </button>
              </div>
            </motion.div>
          )}

          {escalated && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full bg-brand-green/10 border border-brand-green rounded-xl p-4 flex items-center justify-center gap-3 backdrop-blur-md"
            >
              <CheckCircle className="w-6 h-6 text-brand-green" />
              <h3 className="text-brand-green font-bold text-lg">Alert escalated to On-Duty Inspector (Rajesh K.)</h3>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AI Debate Chat UI */}
      {inferenceResult?.transcript && (
        <div className="w-full max-w-4xl bg-white border border-emerald-200 rounded-xl shadow-sm p-4 overflow-hidden mt-4">
          <h3 className="text-emerald-950 font-bold mb-4 flex items-center gap-2 border-b border-emerald-100 pb-2">
            <BrainCircuit className="w-5 h-5 text-brand-saffron" /> Live Agent Debate Transcript
          </h3>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {inferenceResult.transcript.map((msg, idx) => {
              const isGemini = msg.role.includes('gemini');
              const isJudge = msg.role === 'judge';
              const isUser = msg.role === 'user';
              
              return (
                <div key={idx} className={`flex ${isGemini ? 'justify-start' : (isJudge ? 'justify-center' : (isUser ? 'justify-end' : 'justify-end'))}`}>
                  <div className={`max-w-[80%] rounded-xl p-3 ${
                    isUser ? 'bg-[#0A2647] text-white border-none rounded-tr-none' :
                    isJudge ? 'bg-amber-100 border border-amber-300 text-amber-900 w-full text-center font-medium' :
                    isGemini ? 'bg-blue-50 border border-blue-200 text-blue-900 rounded-tl-none' :
                    'bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-tr-none'
                  }`}>
                    <div className="flex items-center gap-2 mb-1 text-xs font-bold uppercase opacity-60">
                      {isUser ? '' : (isJudge ? <Scale className="w-3 h-3" /> : <Bot className="w-3 h-3" />)}
                      {msg.role.replace('_', ' ')}
                    </div>
                    <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              );
            })}
            {qaLoading && (
              <div className="flex justify-end">
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl rounded-tr-none p-3 text-sm italic opacity-70">
                  Thinking...
                </div>
              </div>
            )}
          </div>
          
          <form onSubmit={handleAskQuestion} className="mt-4 pt-4 border-t border-emerald-100 flex gap-2">
            <input 
              type="text" 
              value={qaInput}
              onChange={(e) => setQaInput(e.target.value)}
              placeholder="Question the verdict or ask for clarification..." 
              className="flex-1 px-3 py-2 border border-emerald-200 rounded focus:outline-none focus:border-brand-saffron focus:ring-1 focus:ring-brand-saffron text-sm text-emerald-900"
              disabled={qaLoading}
            />
            <button 
              type="submit" 
              disabled={qaLoading}
              className="bg-[#0A2647] text-white px-4 py-2 rounded text-sm font-bold hover:bg-[#153C6E] transition-colors disabled:opacity-70"
            >
              Ask Agent
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
