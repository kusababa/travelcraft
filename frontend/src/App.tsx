import { useState, useRef } from "react";
import html2pdf from "html2pdf.js";

function App() {
  const [country, setCountry] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const [arrival, setArrival] = useState("");
  const [departure, setDeparture] = useState("");
  const [style, setStyle] = useState("relax");
  const [travelPlan, setTravelPlan] = useState("");
  const planRef = useRef<HTMLDivElement | null>(null);

  const countries = {
    イタリア: ["ローマ", "ミラノ", "フィレンツェ"],
    フランス: ["パリ", "リヨン", "ニース"],
    スペイン: ["バルセロナ", "マドリード", "セビリア"],
  };

  const handleGeneratePlan = async () => {
    if (!country || cities.length === 0 || !arrival || !departure) {
      alert("全ての項目を入力してください");
      return;
    }

    const payload = {
      country,
      cities,
      arrival,
      departure,
      style,
    };

    try {
      const response = await fetch("http://localhost:8000/generate-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`APIエラー: ${response.status}`);
      }

      const data = await response.json();
      console.log("旅プラン：", data.plan);
      setTravelPlan(data.plan);
    } catch (error: any) {
      console.error("プラン生成に失敗しました", error.message || error);
      alert("旅プランの生成に失敗しました。サーバーが起動しているか確認してください。");
    }
  };

  const handleExportPDF = () => {
    if (!planRef.current) return;

    const opt = {
      margin: 0.5,
      filename: "travel_plan.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    html2pdf().set(opt).from(planRef.current).save();
  };

  return (
    <div className="p-8 space-y-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold text-center">TravelCraft</h1>

      {/* 国選択 */}
      <div>
        <label className="block font-semibold">国を選択</label>
        <select
          value={country}
          onChange={(e) => {
            setCountry(e.target.value);
            setCities([]);
          }}
          className="border p-2 w-full rounded"
        >
          <option value="">-- 選択してください --</option>
          {Object.keys(countries).map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* 都市選択 */}
      {country && (
        <div>
          <label className="block font-semibold">都市を選択（複数可）</label>
          <div className="space-y-2">
            {countries[country].map((city) => (
              <label key={city} className="block">
                <input
                  type="checkbox"
                  value={city}
                  checked={cities.includes(city)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setCities([...cities, city]);
                    } else {
                      setCities(cities.filter((c) => c !== city));
                    }
                  }}
                  className="mr-2"
                />
                {city}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* 到着・出発 */}
      <div>
        <label className="block font-semibold">到着日時</label>
        <input
          type="datetime-local"
          value={arrival}
          onChange={(e) => setArrival(e.target.value)}
          className="border p-2 w-full rounded"
        />
      </div>
      <div>
        <label className="block font-semibold">出発日時</label>
        <input
          type="datetime-local"
          value={departure}
          onChange={(e) => setDeparture(e.target.value)}
          className="border p-2 w-full rounded"
        />
      </div>

      {/* スタイル */}
      <div>
        <label className="block font-semibold">旅のスタイル</label>
        <div className="flex gap-4 mt-2">
          <button
            className={`p-2 rounded w-full ${
              style === "relax" ? "bg-blue-500 text-white" : "bg-gray-100"
            }`}
            onClick={() => setStyle("relax")}
          >
            のんびり
          </button>
          <button
            className={`p-2 rounded w-full ${
              style === "tight" ? "bg-blue-500 text-white" : "bg-gray-100"
            }`}
            onClick={() => setStyle("tight")}
          >
            しっかり
          </button>
        </div>
      </div>

      {/* 生成ボタン */}
      <div className="text-center">
        <button
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          onClick={handleGeneratePlan}
        >
          旅プランを生成
        </button>
      </div>

      {/* 旅のしおり */}
      {travelPlan && (
        <div ref={planRef} className="mt-6 p-4 border rounded bg-gray-50">
          <h2 className="text-xl font-bold mb-2">📘 旅のしおり</h2>
          <ul className="space-y-2">
            {travelPlan.split("\n").map((line, index) => (
              <li key={index} className="p-2 bg-white rounded shadow text-gray-800">
                {line}
              </li>
            ))}
          </ul>

          {/* PDF出力ボタン */}
          <div className="mt-4 text-right">
            <button
              onClick={handleExportPDF}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              PDFとして保存
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
