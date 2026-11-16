#ifndef FS_NT_H
#define FS_NT_H

// Definitions of needed Windows kernel APIs, mostly taken from winternl.h and
// the Windows SDK documentation.
//
// Copyright (c) Microsoft Corp. All rights reserved.

#include <windows.h>

#include <ntstatus.h>

#define FILE_SUPERSEDE           0x00000000
#define FILE_OPEN                0x00000001
#define FILE_CREATE              0x00000002
#define FILE_OPEN_IF             0x00000003
#define FILE_OVERWRITE           0x00000004
#define FILE_OVERWRITE_IF        0x00000005
#define FILE_MAXIMUM_DISPOSITION 0x00000005

#define FILE_SUPERSEDED     0x00000000
#define FILE_OPENED         0x00000001
#define FILE_CREATED        0x00000002
#define FILE_OVERWRITTEN    0x00000003
#define FILE_EXISTS         0x00000004
#define FILE_DOES_NOT_EXIST 0x00000005

typedef struct _UNICODE_STRING {
  USHORT Length;
  USHORT MaximumLength;
  PWSTR Buffer;
} UNICODE_STRING, *PUNICODE_STRING;

typedef struct _OBJECT_ATTRIBUTES {
  ULONG Length;
  HANDLE RootDirectory;
  PUNICODE_STRING ObjectName;
  ULONG Attributes;
  PVOID SecurityDescriptor;
  PVOID SecurityQualityOfService;
} OBJECT_ATTRIBUTES, *POBJECT_ATTRIBUTES;

typedef struct _IO_STATUS_BLOCK {
  union {
    NTSTATUS Status;
    PVOID Pointer;
  };
  ULONG_PTR Information;
} IO_STATUS_BLOCK, *PIO_STATUS_BLOCK;

typedef struct _FILE_STANDARD_INFORMATION {
  LARGE_INTEGER AllocationSize;
  LARGE_INTEGER EndOfFile;
  ULONG NumberOfLinks;
  BOOLEAN DeletePending;
  BOOLEAN Directory;
} FILE_STANDARD_INFORMATION, *PFILE_STANDARD_INFORMATION;

typedef struct _FILE_STREAM_INFORMATION {
  ULONG NextEntryOffset;
  ULONG StreamNameLength;
  LARGE_INTEGER StreamSize;
  LARGE_INTEGER StreamAllocationSize;
  WCHAR StreamName[1];
} FILE_STREAM_INFORMATION, *PFILE_STREAM_INFORMATION;

typedef enum _FILE_INFORMATION_CLASS {
  FileDirectoryInformation = 1,
  FileFullDirectoryInformation,                 // 2
  FileBothDirectoryInformation,                 // 3
  FileBasicInformation,                         // 4
  FileStandardInformation,                      // 5
  FileInternalInformation,                      // 6
  FileEaInformation,                            // 7
  FileAccessInformation,                        // 8
  FileNameInformation,                          // 9
  FileRenameInformation,                        // 10
  FileLinkInformation,                          // 11
  FileNamesInformation,                         // 12
  FileDispositionInformation,                   // 13
  FilePositionInformation,                      // 14
  FileFullEaInformation,                        // 15
  FileModeInformation,                          // 16
  FileAlignmentInformation,                     // 17
  FileAllInformation,                           // 18
  FileAllocationInformation,                    // 19
  FileEndOfFileInformation,                     // 20
  FileAlternateNameInformation,                 // 21
  FileStreamInformation,                        // 22
  FilePipeInformation,                          // 23
  FilePipeLocalInformation,                     // 24
  FilePipeRemoteInformation,                    // 25
  FileMailslotQueryInformation,                 // 26
  FileMailslotSetInformation,                   // 27
  FileCompressionInformation,                   // 28
  FileObjectIdInformation,                      // 29
  FileCompletionInformation,                    // 30
  FileMoveClusterInformation,                   // 31
  FileQuotaInformation,                         // 32
  FileReparsePointInformation,                  // 33
  FileNetworkOpenInformation,                   // 34
  FileAttributeTagInformation,                  // 35
  FileTrackingInformation,                      // 36
  FileIdBothDirectoryInformation,               // 37
  FileIdFullDirectoryInformation,               // 38
  FileValidDataLengthInformation,               // 39
  FileShortNameInformation,                     // 40
  FileIoCompletionNotificationInformation,      // 41
  FileIoStatusBlockRangeInformation,            // 42
  FileIoPriorityHintInformation,                // 43
  FileSfioReserveInformation,                   // 44
  FileSfioVolumeInformation,                    // 45
  FileHardLinkInformation,                      // 46
  FileProcessIdsUsingFileInformation,           // 47
  FileNormalizedNameInformation,                // 48
  FileNetworkPhysicalNameInformation,           // 49
  FileIdGlobalTxDirectoryInformation,           // 50
  FileIsRemoteDeviceInformation,                // 51
  FileUnusedInformation,                        // 52
  FileNumaNodeInformation,                      // 53
  FileStandardLinkInformation,                  // 54
  FileRemoteProtocolInformation,                // 55
  FileRenameInformationBypassAccessCheck,       // 56
  FileLinkInformationBypassAccessCheck,         // 57
  FileVolumeNameInformation,                    // 58
  FileIdInformation,                            // 59
  FileIdExtdDirectoryInformation,               // 60
  FileReplaceCompletionInformation,             // 61
  FileHardLinkFullIdInformation,                // 62
  FileIdExtdBothDirectoryInformation,           // 63
  FileDispositionInformationEx,                 // 64
  FileRenameInformationEx,                      // 65
  FileRenameInformationExBypassAccessCheck,     // 66
  FileDesiredStorageClassInformation,           // 67
  FileStatInformation,                          // 68
  FileMemoryPartitionInformation,               // 69
  FileStatLxInformation,                        // 70
  FileCaseSensitiveInformation,                 // 71
  FileLinkInformationEx,                        // 72
  FileLinkInformationExBypassAccessCheck,       // 73
  FileStorageReserveIdInformation,              // 74
  FileCaseSensitiveInformationForceAccessCheck, // 75
  FileKnownFolderInformation,                   // 76
  FileMaximumInformation
} FILE_INFORMATION_CLASS,
  *PFILE_INFORMATION_CLASS;

typedef VOID(NTAPI *PIO_APC_ROUTINE)(
  IN PVOID ApcContext,
  IN PIO_STATUS_BLOCK IoStatusBlock,
  IN ULONG Reserved
);

__kernel_entry NTSYSCALLAPI NTSTATUS NTAPI
NtClose(
  IN HANDLE Handle
);

__kernel_entry NTSYSCALLAPI NTSTATUS NTAPI
NtCreateFile(
  OUT PHANDLE FileHandle,
  IN ACCESS_MASK DesiredAccess,
  IN POBJECT_ATTRIBUTES ObjectAttributes,
  OUT PIO_STATUS_BLOCK IoStatusBlock,
  IN PLARGE_INTEGER AllocationSize OPTIONAL,
  IN ULONG FileAttributes,
  IN ULONG ShareAccess,
  IN ULONG CreateDisposition,
  IN ULONG CreateOptions,
  IN PVOID EaBuffer OPTIONAL,
  IN ULONG EaLength
);

__kernel_entry NTSYSCALLAPI NTSTATUS NTAPI
NtOpenFile(
  OUT PHANDLE FileHandle,
  IN ACCESS_MASK DesiredAccess,
  IN POBJECT_ATTRIBUTES ObjectAttributes,
  OUT PIO_STATUS_BLOCK IoStatusBlock,
  IN ULONG ShareAccess,
  IN ULONG OpenOptions
);

__kernel_entry NTSYSCALLAPI NTSTATUS NTAPI
NtReadFile(
  IN HANDLE FileHandle,
  IN HANDLE Event,
  IN PIO_APC_ROUTINE ApcRoutine,
  IN PVOID ApcContext,
  OUT PIO_STATUS_BLOCK IoStatusBlock,
  OUT PVOID Buffer,
  IN ULONG Length,
  IN PLARGE_INTEGER ByteOffset,
  IN PULONG Key
);

__kernel_entry NTSYSCALLAPI NTSTATUS NTAPI
NtWriteFile(
  IN HANDLE FileHandle,
  IN HANDLE Event,
  IN PIO_APC_ROUTINE ApcRoutine,
  IN PVOID ApcContext,
  OUT PIO_STATUS_BLOCK IoStatusBlock,
  IN PVOID Buffer,
  IN ULONG Length,
  IN PLARGE_INTEGER ByteOffset,
  IN PULONG Key
);

__kernel_entry NTSYSCALLAPI NTSTATUS NTAPI
NtDeleteFile(
  IN POBJECT_ATTRIBUTES ObjectAttributes
);

__kernel_entry NTSYSCALLAPI NTSTATUS NTAPI
NtQueryInformationFile(
  IN HANDLE FileHandle,
  OUT PIO_STATUS_BLOCK IoStatusBlock,
  OUT PVOID FileInformation,
  IN ULONG Length,
  IN FILE_INFORMATION_CLASS FileInformationClass
);

#endif // FS_NT_H
