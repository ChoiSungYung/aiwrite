import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const MODEL_VERSIONS = ['gpt-o1', 'gpt-4o'];
const ITEMS_PER_PAGE = 10;

const WorkManager = () => {
  const [workData, setWorkData] = useState({
    title: '',
    genre: '',
    themes: [],
    description: '',
    content: '',
    model_version: MODEL_VERSIONS[0],
    cover_url: '',
    prompt: '',
    original_text: '',
    variation_prompt: '',
    variation_text: ''
  });

  const [themeInput, setThemeInput] = useState('');
  const [works, setWorks] = useState([]);
  const [selectedWork, setSelectedWork] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // 표지 이미지 파일과 미리보기 URL 상태
  const [coverFile, setCoverFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  useEffect(() => {
    fetchWorks();
  }, [currentPage]);

  const fetchWorks = async () => {
    try {
      const { count, error: countError } = await supabase
        .from('works')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;
      setTotalCount(count);

      const { data, error } = await supabase
        .from('works')
        .select('*')
        .order('id', { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (error) throw error;

      const worksWithParsedThemes = data.map(work => ({
        ...work,
        themes: typeof work.themes === 'string' ? JSON.parse(work.themes) : work.themes
      }));

      setWorks(worksWithParsedThemes);
    } catch (error) {
      console.error('Error fetching works:', error);
      alert('작품 목록을 가져오는데 실패했습니다.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        const { error } = await supabase
          .from('works')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        // 현재 페이지의 데이터가 모두 삭제되었다면 이전 페이지로 이동
        if (works.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        } else {
          fetchWorks(); // 현재 페이지 데이터 다시 불러오기
        }
      } catch (error) {
        console.error('Error deleting work:', error);
        alert('작품 삭제에 실패했습니다.');
      }
    }
  };

  const handleEdit = (work) => {
    setSelectedWork(work);
    const workWithParsedThemes = {
      ...work,
      themes: typeof work.themes === 'string' ? JSON.parse(work.themes) : work.themes
    };
    setWorkData(workWithParsedThemes);
    setCoverFile(null);
    setPreviewUrl(null);
  };

  const handleCoverSelection = (file) => {
    if (file) {
      setCoverFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setCoverFile(null);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let cover_url = workData.cover_url;

    // 선택된 표지 이미지 파일이 있으면 먼저 업로드
    if (coverFile) {
      try {
        const fileName = `${Date.now()}_${coverFile.name}`;
        const { error: uploadError } = await supabase
          .storage
          .from('covers')
          .upload(fileName, coverFile);

        if (uploadError) throw uploadError;

        const { data, error: urlError } = supabase
          .storage
          .from('covers')
          .getPublicUrl(fileName);

        if (urlError) throw urlError;

        cover_url = data.publicUrl;
      } catch (error) {
        console.error('Error uploading cover image:', error);
        alert('표지 이미지 업로드에 실패했습니다.');
        return;
      }
    }
  
    const submitData = {
      ...workData,
      themes: workData.themes,
      cover_url
    };

    try {
      if (selectedWork) {
        const { error } = await supabase
          .from('works')
          .update(submitData)
          .eq('id', selectedWork.id);

        if (error) throw error;
        
        setSelectedWork(null);
        fetchWorks(); // 목록 새로고침
      } else {
        const { error } = await supabase
          .from('works')
          .insert([submitData]);

        if (error) throw error;

        setCurrentPage(1); // 첫 페이지로 이동
        fetchWorks(); // 목록 새로고침
      }

      setWorkData({
        title: '',
        genre: '',
        themes: [],
        description: '',
        content: '',
        model_version: MODEL_VERSIONS[0],
        cover_url: '',
        prompt: '',
        original_text: '',
        variation_prompt: '',
        variation_text: ''
      });
      setThemeInput('');
      setCoverFile(null);
      setPreviewUrl(null);
  
    } catch (error) {
      console.error('Error saving work:', error);
      alert(selectedWork ? '작품 수정에 실패했습니다.' : '작품 등록에 실패했습니다.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setWorkData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleThemeKeyPress = (e) => {
    if (e.key === 'Enter' && themeInput.trim()) {
      e.preventDefault();
      setWorkData(prev => ({
        ...prev,
        themes: [...prev.themes, themeInput.trim()]
      }));
      setThemeInput('');
    }
  };

  const removeTheme = (indexToRemove) => {
    setWorkData(prev => ({
      ...prev,
      themes: prev.themes.filter((_, index) => index !== indexToRemove)
    }));
  };

  const WorkList = () => (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-6">등록된 작품 목록</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left">표지</th>
              <th className="px-4 py-2 text-left">제목</th>
              <th className="px-4 py-2 text-left">장르</th>
              <th className="px-4 py-2 text-left">테마</th>
              <th className="px-4 py-2 text-left">모델</th>
              <th className="px-4 py-2 text-center">관리</th>
            </tr>
          </thead>
          <tbody>
            {works.map((work) => (
              <tr key={work.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">
                  {work.cover_url ? (
                    <img 
                      src={work.cover_url} 
                      alt="cover" 
                      className="h-12 w-auto object-cover" 
                    />
                  ) : (
                    '없음'
                  )}
                </td>
                <td className="px-4 py-2">{work.title}</td>
                <td className="px-4 py-2">{work.genre}</td>
                <td className="px-4 py-2">
                  {Array.isArray(work.themes) ? work.themes.join(', ') : ''}
                </td>
                <td className="px-4 py-2">{work.model_version}</td>
                <td className="px-4 py-2 text-center space-x-2">
                  <button
                    onClick={() => handleEdit(work)}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(work.id)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 flex justify-center space-x-2">
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
        >
          이전
        </button>
        <span className="px-3 py-1">
          {currentPage} / {totalPages || 1}
        </span>
        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
        >
          다음
        </button>
      </div>
    </div>
  );

  // 수정할 때 표시할 표지 이미지: previewUrl 없으면 workData.cover_url 표시
  const currentCoverPreview = previewUrl || (selectedWork && workData.cover_url);

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-6">
          {selectedWork ? '작품 정보 수정' : '새로운 작품 등록'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* 표지 이미지 업로드용 input + 미리보기 */}
          <div>
            <label className="block text-sm font-medium mb-1">표지 이미지 업로드</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                handleCoverSelection(file);
              }}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {(currentCoverPreview) && (
              <div className="mt-2">
                <img src={currentCoverPreview} alt="미리보기" className="max-h-48 object-contain" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">제목</label>
              <input
                type="text"
                name="title"
                value={workData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">장르</label>
              <input
                type="text"
                name="genre"
                value={workData.genre}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">테마</label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={themeInput}
                  onChange={(e) => setThemeInput(e.target.value)}
                  onKeyPress={handleThemeKeyPress}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="엔터를 눌러 테마 추가"
                />
                <div className="flex flex-wrap gap-2">
                  {workData.themes.map((theme, index) => (
                    <span 
                      key={index}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center"
                    >
                      {theme}
                      <button
                        type="button"
                        onClick={() => removeTheme(index)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">모델 버전</label>
              <select
                name="model_version"
                value={workData.model_version}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {MODEL_VERSIONS.map(version => (
                  <option key={version} value={version}>
                    {version}
                  </option>
                ))}
              </select>
            </div>

          </div>

          <div>
            <label className="block text-sm font-medium mb-1">설명</label>
            <textarea
              name="description"
              value={workData.description}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">프롬프트</label>
            <textarea
              type="text"
              name="prompt"
              value={workData.prompt}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">원본 텍스트</label>
            <textarea
              name="original_text"
              value={workData.original_text}
              onChange={handleInputChange}
              rows="6"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">변형 프롬프트</label>
            <textarea
              name="variation_prompt"
              value={workData.variation_prompt}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">변형 텍스트</label>
            <textarea
              name="variation_text"
              value={workData.variation_text}
              onChange={handleInputChange}
              rows="6"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {selectedWork ? '작품 정보 수정' : '작품 등록'}
          </button>
        </form>
      </div>
      <WorkList />
    </div>
  );
};

export default WorkManager;
