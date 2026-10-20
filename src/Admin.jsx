import React, { useState, useEffect } from 'react';

export default function Admin() {
  const [answersList, setAnswersList] = useState([]);

  useEffect(() => {
    const checkUserChoices = () => {
      const data = localStorage.getItem('kira_all_choices');
      if (data) {
        try {
          setAnswersList(JSON.parse(data));
        } catch (e) {
          console.error("Помилка зчитування даних:", e);
        }
      }
    };

    checkUserChoices();
    const interval = setInterval(checkUserChoices, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    localStorage.removeItem('kira_all_choices');
    setAnswersList([]);
  };

  return (
    <div style={{
      padding: '40px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '700px',
      margin: '40px auto',
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      color: '#1e293b'
    }}>
      <h1 style={{ fontSize: '24px', marginBottom: '8px', color: '#0f172a' }}>
        🕵️‍♂️ Адмін-панель (Історія відповідей)
      </h1>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
        Тут відображаються всі відповіді користувачки в реальному часі.
      </p>

      <div style={{
        border: '2px dashed #cbd5e1',
        borderRadius: '12px',
        padding: '24px',
        backgroundColor: '#f8fafc',
        maxHeight: '400px',
        overflowY: 'auto'
      }}>
        {answersList.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {answersList.map((item, index) => (
              <div key={index} style={{
                padding: '12px 16px',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                borderLeft: '4px solid #2563eb'
              }}>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                  {item.step} • {new Date(item.timestamp).toLocaleTimeString()}
                </div>
                <div style={{ fontSize: '16px', color: '#0f172a', fontWeight: '500' }}>
                  <strong>Вибір:</strong> {item.choice}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#94a3b8', margin: 0, padding: '20px 0', textAlign: 'center' }}>
            ⏳ Очікування відповіді користувачки...
          </p>
        )}
      </div>

      {answersList.length > 0 && (
        <button
          onClick={handleReset}
          style={{
            marginTop: '20px',
            width: '100%',
            padding: '12px',
            backgroundColor: '#ef4444',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          Очистити всю історію
        </button>
      )}
    </div>
  );
}