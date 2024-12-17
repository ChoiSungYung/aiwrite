import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/admin/AdminLayout'

export default function DatabaseInfo() {
  const [tables, setTables] = useState([])
  const [selectedTable, setSelectedTable] = useState(null)
  const [tableSchema, setTableSchema] = useState(null)
  const [tableData, setTableData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // 추가: 모든 테이블 스키마 텍스트 변환용 상태
  const [allTablesSchemaText, setAllTablesSchemaText] = useState('')

  useEffect(() => {
    fetchTables()
  }, [])

  // 테이블 목록을 가져옵니다
  async function fetchTables() {
    try {
      setLoading(true)
      setError(null)

      const { data: tablesData, error: tablesError } = await supabase
        .rpc('get_schema_info')

      if (tablesError) throw tablesError
      
      const tablesList = Array.isArray(tablesData) ? tablesData : []
      setTables(tablesList)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching tables:', error)
      setError(error.message)
      setLoading(false)
    }
  }

  // 선택된 테이블의 상세 정보를 가져옵니다
  async function fetchTableDetails(tableName) {
    try {
      setSelectedTable(tableName)
      setError(null)
      setTableData(null) // 데이터 초기화

      // 테이블 데이터 샘플 조회
      const { data: rowsData, error: rowsError } = await supabase
        .from(tableName)
        .select('*')
        .limit(5)

      if (rowsError) {
        console.error('Data fetch error:', rowsError)
        throw rowsError
      }

      // 데이터 가공 (길이 제한 등)
      const processedData = rowsData?.map(row => {
        const processed = {}
        for (const [key, value] of Object.entries(row)) {
          if (typeof value === 'string' && value.length > 100) {
            processed[key] = value.substring(0, 100) + '...'
          } else if (Array.isArray(value)) {
            processed[key] = JSON.stringify(value).substring(0, 100) + '...'
          } else if (typeof value === 'object' && value !== null) {
            processed[key] = JSON.stringify(value).substring(0, 100) + '...'
          } else {
            processed[key] = value
          }
        }
        return processed
      })

      setTableData(processedData)

      // 테이블 스키마 정보 조회
      const { data: schemaData, error: schemaError } = await supabase
        .rpc('get_table_columns', { p_table_name: tableName })

      if (schemaError) {
        console.error('Schema fetch error:', schemaError)
        throw schemaError
      }
      
      setTableSchema(schemaData || [])
    } catch (error) {
      console.error('Error fetching table details:', error)
      setError(error.message)
      setTableData([]) // 에러 시 빈 배열로 설정
    }
  }

  // 모든 테이블 스키마를 텍스트 형태로 가져오기
  async function fetchAllTablesSchemaText() {
    try {
      if (tables.length === 0) {
        setAllTablesSchemaText('테이블이 없습니다.')
        return
      }

      let textResult = ''
      for (const table of tables) {
        const tableName = table.table_name
        const { data: schemaData, error: schemaError } = await supabase
          .rpc('get_table_columns', { p_table_name: tableName })
        
        if (schemaError) {
          console.error(`Error fetching schema for ${tableName}:`, schemaError)
          textResult += `\n[${tableName}] 테이블 스키마 정보를 가져올 수 없습니다.\n`
          continue
        }

        textResult += `\n=== ${tableName} 테이블 구조 ===\n`
        if (schemaData && schemaData.length > 0) {
          schemaData.forEach((column) => {
            textResult += `- ${column.column_name} (${column.data_type}, nullable: ${column.is_nullable}, default: ${column.column_default || '없음'})\n`
          })
        } else {
          textResult += '(스키마 정보 없음)\n'
        }
      }

      setAllTablesSchemaText(textResult.trim())
    } catch (err) {
      console.error('Error fetching all tables schema text:', err)
      setAllTablesSchemaText('모든 테이블 스키마 정보를 가져오는 중 오류가 발생했습니다.')
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-lg">데이터베이스 정보를 불러오는 중...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">데이터베이스 정보</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 테이블 목록 */}
          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">테이블 목록</h2>
            <div className="space-y-2">
              {tables.map((table) => (
                <button
                  key={table.table_name}
                  onClick={() => fetchTableDetails(table.table_name)}
                  className={`w-full text-left px-3 py-2 rounded ${
                    selectedTable === table.table_name
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium">{table.table_name}</div>
                  {table.row_count !== undefined && (
                    <div className="text-sm text-gray-500">
                      {table.row_count}개의 행
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* 모든 테이블 스키마 텍스트 형태로 보기 버튼 */}
            <button
              onClick={fetchAllTablesSchemaText}
              className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              모든 테이블 구조 텍스트로 보기
            </button>
          </div>

          {/* 테이블 상세 정보 */}
          <div className="md:col-span-2 space-y-6">
            {selectedTable && (
              <>
                {/* 스키마 정보 */}
                <div className="bg-white shadow rounded-lg p-4">
                  <h2 className="text-xl font-semibold mb-4">
                    {selectedTable} 테이블 스키마
                  </h2>
                  {tableSchema && tableSchema.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">컬럼명</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">데이터 타입</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nullable</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">기본값</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {tableSchema.map((column, i) => (
                            <tr key={i}>
                              <td className="px-4 py-3 text-sm text-gray-900 font-medium">{column.column_name}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">{column.data_type}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">{column.is_nullable}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">{column.column_default || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-gray-500">스키마 정보를 불러올 수 없습니다.</div>
                  )}
                </div>

                {/* 데이터 샘플 */}
                <div className="bg-white shadow rounded-lg p-4">
                  <h2 className="text-xl font-semibold mb-4">
                    데이터 샘플 (최대 5개)
                  </h2>
                  {tableData && tableData.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {Object.keys(tableData[0]).map((column) => (
                              <th
                                key={column}
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                              >
                                {column}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {tableData.map((row, i) => (
                            <tr key={i}>
                              {Object.values(row).map((value, j) => (
                                <td
                                  key={j}
                                  className="px-4 py-3 text-sm text-gray-500 break-words"
                                >
                                  {value === null ? 'null' : String(value)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-gray-500">데이터가 없습니다.</div>
                  )}
                </div>
              </>
            )}

            {/* 모든 테이블 텍스트 스키마 결과 표시 */}
            {allTablesSchemaText && (
              <div className="bg-white shadow rounded-lg p-4 whitespace-pre-wrap">
                <h2 className="text-xl font-semibold mb-4">C:\Users\User\AI문학관\my-gpt5-literature-site<br></br> SUPABASE 테이블 구조 (텍스트)</h2>
                <div className="text-gray-800 text-sm">
                  {allTablesSchemaText}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
