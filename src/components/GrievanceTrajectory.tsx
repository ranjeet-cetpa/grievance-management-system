import React, { useEffect, useState, useRef } from 'react';
import axiosInstance from '@/services/axiosInstance';
import { Label } from './ui/label';
import Heading from './ui/heading';
import { format } from 'date-fns';
import { findEmployeeDetails } from '@/lib/helperFunction';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import { Hand } from 'lucide-react';

const GrievanceTrajectory = ({ grievanceId, grievance }) => {
  const [trajectory, setTrajectory] = useState([]);
  const [oldTrajectory, setOldTrajectory] = useState([]);
  const [nodeColors, setNodeColors] = useState({});
  const [creator, setCreator] = useState('');
  const containerRef = useRef(null); // Reference for the container
  const employeeList = useSelector((state: RootState) => state.employee.employees);

  const generateRandomColor = () => {
    const r = Math.floor(Math.random() * 156) + 200; // Ensure light colors (100-255)
    const g = Math.floor(Math.random() * 156) + 100;
    const b = Math.floor(Math.random() * 156) + 100;
    return `rgb(${r}, ${g}, ${b})`;
  };
  const formatDate = (date: string) => {
    return date && format(new Date(date), 'dd MMM, yyyy');
  };

  const formatRoleName = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'redressal':
        return 'Complaint Handler';
      case 'nodalofficer':
        return 'Nodal Officer';
      case 'managingdirector':
        return 'Managing Director';
      default:
        return role;
    }
  };
  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    const fetchGrievanceHistory = async () => {
      try {
        const response = await axiosInstance.get(`/Grievance/GrievanceHistory?grievanceId=${grievanceId}`);
        if (response.data.statusCode === 200) {
          let processedData = response.data.data.filter((process) => process.changeList.length > 0);

          // Find processes with Round changes
          const roundChanges = processedData.filter((process) =>
            process.changeList.some((change) => change.column === 'Round')
          );
          const creator = findEmployeeDetails(employeeList, grievance?.createdBy)?.employee?.empName;
          setCreator(creator);

          // For each round change, insert creator's info
          roundChanges.forEach((roundProcess, index) => {
            const roundChangeIndex = processedData.findIndex(
              (p) => p.grievanceProcessId === roundProcess.grievanceProcessId
            );

            if (roundChangeIndex !== -1) {
              const creatorNode = {
                grievanceProcessId: `creator-${roundProcess.grievanceProcessId}`,
                border: true,
                roundchanger: true,
                changeList: [
                  {
                    column: 'AssignedUserCode',
                    oldValue: grievance.createdBy,
                    newValue: grievance.createdBy,
                  },
                  {
                    column: 'AssignedUserDetails',
                    oldValue: creator,
                    newValue: creator,
                  },
                  {
                    column: 'RoleName',
                    oldValue: `${roundChanges.length - index}`,
                    newValue: `${roundChanges.length - index}`,
                  },
                  {
                    column: 'CreatedDate',
                    oldValue: roundProcess.changeList.find((c) => c.column === 'CreatedDate')?.oldValue,
                    newValue: roundProcess.changeList.find((c) => c.column === 'CreatedDate')?.oldValue,
                  },
                ],
              };
              processedData.splice(roundChangeIndex, 0, creatorNode);
            }
          });

          const filteredData = processedData.reverse().filter((current, index, array) => {
            const currentAssignedUserCode = current.changeList.some((change) => change.column === 'AssignedUserCode');
            const nextAssignedUserCode = array[index + 1]?.changeList.find(
              (change) => change.column === 'AssignedUserCode'
            )?.newValue;
            return currentAssignedUserCode && currentAssignedUserCode !== nextAssignedUserCode;
          });

          setOldTrajectory(filteredData);

          let newFilteredData = [...filteredData].sort((a, b) => {
            const dateAObj = a.changeList.find((item) => item.column === 'CreatedDate');
            const dateBObj = b.changeList.find((item) => item.column === 'CreatedDate');

            const dateA = dateAObj ? new Date(dateAObj.newValue) : new Date(0);
            const dateB = dateBObj ? new Date(dateBObj.newValue) : new Date(0);

            return dateA - dateB;
          });

          setTrajectory(newFilteredData);
          const colors = {};
          newFilteredData.forEach((process) => {
            if (process.grievanceProcessId.toString().includes('creator-')) {
              colors[process.grievanceProcessId] = '#FFE4B5';
            } else {
              colors[process.grievanceProcessId] = generateRandomColor();
            }
          });
          setNodeColors(colors);
        }
      } catch (error) {
        console.error('Error fetching grievance history:', error);
      }
    };

    fetchGrievanceHistory();
  }, [grievanceId, grievance]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = containerRef.current.scrollWidth;
    }
  }, [trajectory]);

  return (
    <div>
      {trajectory[0] && (
        <div className="flex flex-col gap-2 my-2">
          <Heading type={6} className="px-4">
            Grievance Flow History
          </Heading>
          <div
            ref={containerRef}
            className="flex items-center space-x-6 overflow-x-auto p-6 bg-gray-50 rounded-lg shadow-md"
          >
            <div className="flex items-center">
              <div
                className="text-sm font-semibold min-w-[220px] h-[80px] px-3 py-2 rounded-lg shadow flex flex-col justify-between"
                style={{
                  backgroundColor: '#e6ffe6',
                  border: '3px solid green ',
                }}
              >
                <div className="flex justify-between text-xs text-gray-600">
                  <span>{formatDate(grievance?.createdDate)}</span>
                  <span>{formatTime(grievance?.createdDate)}</span>
                </div>
                <div className="text-center">
                  <div>{creator}</div>
                  <div className="text-xs text-gray-600">Requestor</div>
                </div>
              </div>
              <span className="text-3xl font-bold text-gray-400 px-3">→</span>
              <div
                className="text-sm font-semibold min-w-[220px] h-[80px] px-3 py-2 rounded-lg shadow flex flex-col justify-between"
                style={{
                  backgroundColor: 'lightblue',
                }}
              >
                <div className="flex justify-between text-xs text-gray-600">
                  <span>{formatDate(grievance?.createdDate)}</span>
                  <span>{formatTime(grievance?.createdDate)}</span>
                </div>
                <div className="text-center">
                  <div>
                    {oldTrajectory[0]?.changeList.find((change) => change.column === 'AssignedUserDetails')?.oldValue}
                  </div>
                  <div className="text-xs text-gray-600">
                    {oldTrajectory[0]?.changeList.find((change) => change.column === 'RoleName')?.oldValue ===
                    'Redressal'
                      ? 'Complaint Handler'
                      : formatRoleName(
                          oldTrajectory[0]?.changeList.find((change) => change.column === 'RoleName')?.oldValue
                        )}
                  </div>
                </div>
              </div>
              <span className="text-3xl font-bold text-gray-400 px-3">→</span>
            </div>
            {trajectory.map((process, index) => {
              const assignedUserChange = process.changeList.find((change) => change.column === 'AssignedUserCode');
              const assignedUserDetailsChange = process.changeList.find(
                (change) => change.column === 'AssignedUserDetails'
              );
              const assignedUserRoleDetails = process.changeList.find((change) => change.column === 'RoleName');
              const createdDateChange = process.changeList.find((change) => change.column === 'CreatedDate');
              const comment = process?.commentList?.comment || '';

              return (
                <div key={process.grievanceProcessId} className="flex items-center">
                  <div
                    className="text-sm font-semibold min-w-[220px] h-[80px] px-3 py-2 rounded-lg shadow flex flex-col justify-between"
                    style={{
                      backgroundColor: nodeColors[process.grievanceProcessId] || '#E5E7EB',
                      color: '#000',
                      border: process.border ? '3px solid red' : 'none',
                    }}
                  >
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{formatDate(createdDateChange?.newValue)}</span>
                      <div className="flex gap-1 items-center">
                        {process.border && (
                          <div className="mb-0.5 h-4 w-4 flex items-center justify-center">
                            <svg
                              version="1.1"
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 512 512"
                            >
                              <path
                                d="M0 0 C10.37415211 8.6142513 16.06628113 19.78123468 18 33 C18.09201844 35.05580306 18.13779956 37.11402712 18.14526367 39.171875 C18.15483345 40.97797241 18.15483345 40.97797241 18.16459656 42.82055664 C18.16626579 44.7656311 18.16626579 44.7656311 18.16796875 46.75 C18.17119404 48.12687207 18.17455899 49.50374382 18.17805481 50.88061523 C18.18404094 53.77897935 18.18589618 56.67731374 18.18530273 59.57568359 C18.18522279 62.48232426 18.19194782 65.3888029 18.20581055 68.29541016 C18.32427544 93.53581254 17.54287094 118.68104915 14.3125 143.75 C14.14588867 145.0488916 13.97927734 146.3477832 13.80761719 147.68603516 C10.52170305 172.35425038 5.02199109 196.4364307 -3 220 C-3.27779297 220.83950195 -3.55558594 221.67900391 -3.84179688 222.54394531 C-10.48223512 242.50584952 -19.94525155 261.1253984 -31.04882812 278.95019531 C-40.74618906 294.53873016 -47.52307691 310.07633591 -51.25 328.125 C-51.41338867 328.91165039 -51.57677734 329.69830078 -51.74511719 330.50878906 C-54.43918881 344.47315603 -54.09373187 358.53156738 -53.98346901 372.68671608 C-53.95657111 376.33188843 -53.93886656 379.97699789 -53.92399597 383.62223816 C-53.88148576 393.97703214 -53.83335345 404.33170012 -53.75317383 414.6862793 C-53.70461817 421.04251489 -53.67565191 427.39858321 -53.65942955 433.75498009 C-53.64955083 436.16828174 -53.63236947 438.58156529 -53.60764503 440.99476051 C-53.57383879 444.36626259 -53.56500998 447.7369918 -53.56176758 451.10864258 C-53.54581543 452.09738876 -53.52986328 453.08613495 -53.51342773 454.10484314 C-53.54532544 461.39313148 -55.16138081 466.64047955 -59.89453125 472.2421875 C-60.52746094 472.78101563 -61.16039062 473.31984375 -61.8125 473.875 C-62.43769531 474.42929687 -63.06289063 474.98359375 -63.70703125 475.5546875 C-70.45677884 479.80921324 -77.91146395 479.28754113 -85.61921692 479.26742554 C-86.89221057 479.27195665 -88.16520422 479.27648776 -89.47677344 479.28115618 C-92.99896914 479.29335944 -96.52106967 479.29312889 -100.04328167 479.29076743 C-103.84639956 479.29035859 -107.64948722 479.30140481 -111.45259094 479.31088257 C-118.89929326 479.32747863 -126.3459639 479.33299148 -133.79268316 479.33410732 C-139.84697389 479.33505842 -145.90125418 479.33917178 -151.95554161 479.34550858 C-169.1288421 479.36311684 -186.30211761 479.37234804 -203.47542719 479.37084763 C-204.86346353 479.37072776 -204.86346353 479.37072776 -206.27954102 479.37060547 C-207.20603121 479.37052371 -208.1325214 479.37044195 -209.08708706 479.37035771 C-224.10167045 479.36954483 -239.11615352 479.38868406 -254.1307079 479.4168822 C-269.55565421 479.44562201 -284.98055162 479.45942191 -300.40552539 479.45769465 C-309.06223615 479.45703115 -317.71884172 479.46250601 -326.37552834 479.48405075 C-333.74591674 479.50227694 -341.11615227 479.50659807 -348.48655347 479.4930319 C-352.24481754 479.48650959 -356.00278844 479.4863581 -359.76102448 479.5037384 C-363.84084801 479.5224114 -367.91999511 479.50989563 -371.99983215 479.49447632 C-373.17990477 479.50476344 -374.35997738 479.51505057 -375.57580978 479.52564943 C-383.71407074 479.45775074 -390.91545503 478.2335981 -397.4375 473.0703125 C-397.953125 472.42835938 -398.46875 471.78640625 -399 471.125 C-399.53625 470.48820312 -400.0725 469.85140625 -400.625 469.1953125 C-404.10900653 463.63277934 -404.29345642 458.24990148 -404.2746582 451.8996582 C-404.27976913 451.0027124 -404.28488007 450.1057666 -404.29014587 449.18164062 C-404.30402133 446.22128578 -404.30308464 443.26116474 -404.30078125 440.30078125 C-404.30467326 438.22494929 -404.30900896 436.14911812 -404.31376648 434.07328796 C-404.32122724 429.71639431 -404.32094132 425.35958165 -404.31567383 421.00268555 C-404.30992188 415.4713282 -404.32670665 409.94031038 -404.3500185 404.40900898 C-404.36490461 400.11476259 -404.36560683 395.82059477 -404.36250877 391.52632713 C-404.36301597 389.49057539 -404.368138 387.45481852 -404.37832069 385.41909218 C-404.5404922 348.41877381 -395.12168023 316.00866427 -369 289 C-368.48203857 288.46012451 -367.96407715 287.92024902 -367.43041992 287.36401367 C-358.31682704 278.02574054 -347.6223295 270.63288671 -336.3125 264.1875 C-335.55864014 263.74881592 -334.80478027 263.31013184 -334.02807617 262.8581543 C-331.06425629 261.22867173 -328.85045541 260.0259681 -325.44140625 259.921875 C-321.82881618 261.51719478 -318.80395611 263.73860009 -315.625 266.0625 C-281.68593 290.00121467 -241.17389534 297.35090764 -200.51123047 290.44873047 C-176.20132712 286.10480646 -152.56992186 275.34615206 -134 259 C-132.12747884 257.51769654 -130.25244592 256.03856093 -128.375 254.5625 C-106.91469868 236.9126215 -93.87944221 210.17827602 -86 184 C-85.74025391 183.15711426 -85.48050781 182.31422852 -85.21289062 181.44580078 C-73.46107631 142.8461687 -71.58251171 103.40085048 -71.49468994 63.39349365 C-71.48306914 58.62501041 -71.459367 53.85687459 -71.41999817 49.08853722 C-71.40670175 46.90617835 -71.41053641 44.72432767 -71.41540527 42.54194641 C-71.35686862 27.97422708 -68.46085273 14.84131353 -58.5 3.75 C-42.15859262 -11.4936161 -17.94709576 -13.3693737 0 0 Z "
                                fill="#000000"
                                transform="translate(449,21)"
                              />
                              <path
                                d="M0 0 C1.17949219 0.58523437 2.35898437 1.17046875 3.57421875 1.7734375 C26.99456065 14.20483958 44.85029961 35.80440849 53 61 C61.9002573 91.26504356 59.08922112 120.68929903 44.23022461 148.53613281 C40.83894512 154.6083188 36.58820834 159.78815169 32 165 C31.21625 166.03125 30.4325 167.0625 29.625 168.125 C10.11983026 189.48780495 -17.31466111 199.05843108 -45.48046875 201.1875 C-74.09915725 202.07318475 -101.00959869 190.57207092 -121.82421875 171.3984375 C-127.69862963 165.70835329 -132.65934079 159.92613661 -137 153 C-137.87591797 151.64841797 -137.87591797 151.64841797 -138.76953125 150.26953125 C-153.35863574 126.7171861 -157.6039463 97.51233202 -151.4453125 70.57373047 C-147.14632107 53.48722982 -140.04263494 39.67875268 -129 26 C-128.49984375 25.34644531 -127.9996875 24.69289062 -127.484375 24.01953125 C-112.09687791 4.696726 -85.36874671 -7.54772759 -61.37841797 -10.75244141 C-39.76375581 -13.00221224 -19.33468954 -9.89502238 0 0 Z "
                                fill="#000000"
                                transform="translate(268,69)"
                              />
                            </svg>
                          </div>
                        )}
                        {process.border && '(' + assignedUserRoleDetails?.newValue + ')'}
                      </div>
                      <span>{formatTime(createdDateChange?.newValue)}</span>
                    </div>
                    <div className="text-center">
                      <div>{assignedUserDetailsChange?.newValue}</div>
                      {!process.border && (
                        <div className="text-xs text-gray-600">{formatRoleName(assignedUserRoleDetails?.newValue)}</div>
                      )}
                      {process.border && <div className="text-xs text-gray-600">Requestor</div>}
                    </div>
                  </div>
                  {index < trajectory.length - 1 && <span className="text-3xl font-bold text-gray-400 px-3">→</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default GrievanceTrajectory;
