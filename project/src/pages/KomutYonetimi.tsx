import React from 'react';
import { FileText, Plus, Edit2, Trash2 } from 'lucide-react';

interface Komut {
  id: number;
  komut: string;
  aciklama: string;
  cevap: string;
  aktif: boolean;
}

export default function KomutYonetimi() {
  const [modalAcik, setModalAcik] = React.useState(false);
  const [seciliKomut, setSeciliKomut] = React.useState<Komut | null>(null);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Komut Yönetimi</h1>
        <button
          onClick={() => {
            setSeciliKomut(null);
            setModalAcik(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Yeni Komut
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2 text-gray-700">
            <FileText size={20} />
            <h2 className="font-semibold">Bot Komutları</h2>
          </div>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Komut</th>
                  <th className="text-left py-3 px-4">Açıklama</th>
                  <th className="text-left py-3 px-4">Durum</th>
                  <th className="text-right py-3 px-4">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">/start</td>
                  <td className="py-3 px-4">Başlangıç mesajı</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      Aktif
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {}}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Düzenle"
                      >
                        <Edit2 size={18} className="text-gray-500" />
                      </button>
                      <button
                        onClick={() => {}}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Sil"
                      >
                        <Trash2 size={18} className="text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalAcik && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                {seciliKomut ? 'Komut Düzenle' : 'Yeni Komut'}
              </h2>
              <button
                onClick={() => setModalAcik(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <Trash2 size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Komut
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg"
                  placeholder="/komut"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg"
                  placeholder="Komut açıklaması"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cevap
                </label>
                <textarea
                  className="w-full h-32 p-2 border rounded-lg"
                  placeholder="Komut çalıştığında gönderilecek mesaj"
                />
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm text-gray-700">Aktif</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setModalAcik(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  İptal
                </button>
                <button
                  onClick={() => {
                    setModalAcik(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}