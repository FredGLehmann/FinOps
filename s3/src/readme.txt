Format des données à envoyer
1
Date/heure 
environnement
nom du bucket
nb de fichiers stockage standard 
volume stockage standard
nb de fichiers stockage IA 
volume stockage IA
nb de fichiers stockage redondance reduite 
volume stockage redondance reduite
volume stockage total
2
Date/heure 
environnement
nom du bucket=ENV_SOMME_BUCKET
nb de fichiers stockage standard 
volume stockage standard
nb de fichiers stockage IA 
volume stockage IA
nb de fichiers stockage redondance reduite 
volume stockage redondance reduite
volume stockage total

JSON:
{index: 'ec2startstoplogs',
type: 'ec2startstoplog',
body: { account: '716783647419',
region: 'eu-west-1',
time: '2018-04-03T19:02:39Z',
instanceid: 'i-0c999532e4849f025',
instancestate: 'stopping',
instancetype: 'm4.large',
DR: 'True',
Support: 'frederic.lehmann@transdev.com',
StopDailyTime: '20:00:00+01:00',
Country: 'FR',
Backup: 'True',
OpeningDays: 'MON,TUE,WED,THU,FRI',
BillingCode: '4210',
Role: 'TALEND - Serveur TAC',
Environment: 'Dev',
KillDate: '2025-06-30',
Name: 'DEV03-TALENDTAC',
AppName: 'TALEND ETL' },
}