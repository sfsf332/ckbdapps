import React, { useEffect, useRef, useState } from 'react'

import { useTranslation } from 'react-i18next';
import HalvingAnimate from './HalvingAnimate';

import { ReactComponent as CKBLogo } from '../../assets/images/nervos-logo-white.svg';
import useCKBHalving from '../../hooks/useCKBHalving';
import BitTooltip from '../tooltip/bitTooltip';
import BlockchainProgressBar from '../progressbar/BlockchainProgressBar';
import CountdownTimer from '../countdown/CountdownTimer';
import CKBTipSummary from '../CKBTipSummary/CKBTipSummary';
import useCKBTipHeader from '../../hooks/useCKBTipHeader';
import { FormatLocaleDate, FormatLocaleDateTime, getNextHalvingEpoch, getTimeZoneOffset } from '../../utils/helper';
import Countdown from '../countdown/Countdown';

const HalvingContainer = (props) => {

    const [t] = useTranslation();

    const [showPopup, setShowPopup] = useState(false);

    const { data, isLoading, isError } = useCKBHalving();
    const { data: tipHeader, isLoading: isLoadingHeader, isError: isTipHeaderErr } = useCKBTipHeader();

    useEffect(() => {

    }, []);

    const getHalvingDurationYears = () => {
        if (!data || !data.estimatedHalvingTime) {
            return 366;
        }

        let duration = data.estimatedHalvingTime - new Date().getTime();
        let days = Math.floor(duration / (1000 * 60 * 60 * 24));
        //sconsole.log(days);
        return days / 365;
    }

    const renderTwitterShareLink = () => {
        if (!data || !data.estimatedHalvingTime) {
            return <></>
        }

        let duration = data.estimatedHalvingTime - new Date().getTime();
        let days = Math.floor(duration / (1000 * 60 * 60 * 24));
        let countdown = days;
        let countdownUnit = t('halving.days');

        if (days < 1) {
            const hours = Math.floor(
                (duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            );
            if (hours > 0) {
                countdown = hours;
                countdownUnit = t('halving.hours');
            }
            else {
                const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
                if (minutes > 0) {
                    countdown = minutes;
                    countdownUnit = t('halving.minutes');
                }
                else {
                    const seconds = Math.floor((duration % (1000 * 60)) / 1000);
                    if (seconds > 0) {
                        countdown = seconds;
                        countdownUnit = t('halving.seconds');
                    }
                    else {
                        return;
                    }

                }
            }
        }

        // before halving
        let shareText = t('halving.twitter-share-content-before-halving', {
            date: FormatLocaleDateTime(data.estimatedHalvingTime),
            timeZone: getTimeZoneOffset(),
            countdown,
            countdownUnit
        });

        // after halving
        if (data.prevHalvingTime) {
            if (data.curEpoch.number - data.prevHalvingTime.epoch < 30 * 6) {
                shareText = t('halving.twitter-share-content-after-halving', {
                    datetime: FormatLocaleDateTime(data.prevHalvingTime.timestamp),
                    timeZone: getTimeZoneOffset()
                });
            }
        }

        let encodedShareText = encodeURIComponent(shareText);
        let url =
            `https://twitter.com/intent/tweet?text=${encodedShareText}`

        return <BitTooltip content={t(`halving.share-twitter`)} direction="top">
            <a className='w-6 h-6 flex justify-center items-center rounded-full bg-white icon-shadow hover:shadow-lg hover:bg-[#ddd] active:bg-emerald-500 focus:outline-none'
                href={url} rel="noopener noreferrer" target="_blank">
                <i className="fa-sm fa-brands fa-x-twitter text-[#28C1B0]"></i>
            </a>
        </BitTooltip>
    }

    const renderClipboardShareLink = () => {
        return
        let url =
            `https://twitter.com/intent/tweet?url=ckbdapps.com&text=`

        /*`📢Nervos CKB*/

        return <a className='w-6 h-6 flex justify-center items-center rounded-full bg-white mr-4 icon-shadow hover:shadow-lg hover:bg-[#ddd] active:bg-emerald-500 focus:outline-none'
            href={url} rel="noopener noreferrer" target="_blank">
            <i className="fa-sm fa-solid fa-link text-[#28C1B0]"></i>
        </a>

    }

    const renderHalvingTip = () => {
        return <div className='flex justify-center'>
            <div className='flex flex-row items-center py-1 px-3 justify-center bg-[#28C1B0] rounded-full'>
                <CKBLogo className='h-7 ml-2'></CKBLogo>
                <div className='flex flex-col w-full'>
                    <div className=' text-[14px] text-[#FFF] flex items-center px-3 font-semibold break-keep'>{getHalvingDurationYears() > 1 ? t('halving.top-tips-gt-1year') : t('halving.top-tips-lt-1year') }</div>
                    {
                        (isLoading || isError) ? <div className='w-20 h-6 animate-pulse'>
                            <div className='w-20 h-4 my-1 mx-16 flex items-center rounded-full bg-slate-500'></div>
                        </div>
                            : <span className='text-center h-6 text-[18px] text-[#232325] px-2 font-semibold'>{new Date(data.estimatedHalvingTime).toLocaleString()}</span>
                    }

                </div>
                {renderTwitterShareLink()}
                {renderClipboardShareLink()}

            </div>
        </div>
    }

    return (<div className='flex flex-col'>
        <div className='bg-[url("../../assets/images/bg_head_halving.jpg")] bg-cover flex flex-col gap-10'>
            <span className='mt-14 w-full text-center text-[24px] md:text-[48px] text-white font-["Zen_Dots"]'>{t('halving.title')}</span>
            {renderHalvingTip()}

            <div className={`max-w-content mx-auto w-full`}>
                {getHalvingDurationYears() > 1 ? 
                    <Countdown targetDate={data?.estimatedHalvingTime/*1684038959*/}></Countdown> : (<CountdownTimer targetDate={data?.estimatedHalvingTime/*1684038959*/} lastHalvedTimestamp={data?.prevHalvingTime?.timestamp}></CountdownTimer>)
            }</div>

            <div className='flex flex-row justify-between -mt-16 md:-mt-20'>
                <div></div>
                <div className='w-full md:w-[800px]'>
                    <HalvingAnimate></HalvingAnimate>
                </div>
                <div></div>
            </div>
        </div>
        <div className='flex flex-col bg-[#F4EFFF] '>
            <div className={`max-w-content mx-auto w-full`}>
                <CKBTipSummary blockNumber={tipHeader?.latestBlock}
                    epoch={tipHeader?.epoch}
                    halvingEpoch={data ? getNextHalvingEpoch(data.curEpoch.number) : NaN}
                    halvingDate={data?.estimatedHalvingTime} >
                </CKBTipSummary>
            </div>

            <div className={`max-w-content mx-auto w-full`}>
                <div className='flex flex-col py-5 px-3 md:px-5'>
                    <div className='flex mb-16'>
                        <span className='grow text-[20px] md:text-[30px] font-bold text-[#232325]'>{t('halving.block-chain-progress')}</span>
                        <a href='https://docs.nervos.org/docs/basics/glossary#epoch' target="_blank" rel="noopener noreferrer" >
                            <span className='flex items-center text-[#733DFF] hover:text-[#9e35FF] underline underline-offset-2'>{t('halving.whats-epoch')}</span>
                        </a>
                    </div>
                    <div className='flex mb-5 gap-1 md:gap-6'>
                        <div className='flex flex-col w-[100px] text-center gap-2'>
                            <span className='text-sm whitespace-nowrap text-black'>{t('halving.genesis-epoch')}</span>
                            <span className='text-center bg-white rounded-full text-[#733DFF] font-bold'># 0</span>
                            <span className='text-[#999999] text-sm text-center'>{FormatLocaleDate(1573852190812)}</span>
                        </div>
                        <div className='flex grow items-center'>
                            <div className="w-[1px] h-12 border-dashed border-r border-black ml-2" />
                            <div className='grow'>
                                <BlockchainProgressBar className='grow'
                                    epoch={tipHeader?.epoch} >
                                </BlockchainProgressBar>
                            </div>
                            <div className="w-[1px] h-12 border-dashed border-l border-black mr-2" />
                        </div>

                        <div className='flex flex-col w-[100px] text-center gap-2'>
                            <span className='text-sm whitespace-nowrap text-black'>{t('halving.halving-epoch')}</span>
                            <span className='text-center bg-white rounded-full text-[#733DFF] font-bold'># {data ? getNextHalvingEpoch(data.curEpoch.number) : '----'}</span>
                            <span className='text-[#999999] text-sm text-center'>{data ? FormatLocaleDate(data.estimatedHalvingTime) : 'YYYY-MM-DD'}</span>
                        </div>
                    </div>

                </div>
            </div>
        </div>

    </div>
    )
}

export default HalvingContainer
